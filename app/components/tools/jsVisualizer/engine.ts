import * as acorn from 'acorn';
import { SimulationStep, StackFrame, QueuedItem, TerminalLog, BrowserEventLoopPhase, TaskType } from './types';

// Structured AST Node definition
interface AstNode {
  type: string;
  name?: string;
  value?: unknown;
  operator?: string;
  left?: AstNode;
  right?: AstNode;
  quasis?: { value: { raw: string } }[];
  loc?: { start: { line: number; column: number }; end?: { line: number; column: number } };
  expression?: AstNode;
  declarations?: { id?: AstNode; init?: AstNode }[];
  body?: AstNode[] | AstNode;
  consequent?: AstNode;
  callee?: AstNode;
  arguments?: AstNode[];
  object?: AstNode;
  property?: AstNode;
  id?: AstNode;
  params?: AstNode[];
  async?: boolean;
  argument?: AstNode;
}

interface CallbackRecord {
  id: string;
  name: string;
  type: TaskType;
  delay: number;
  bodyNode?: AstNode | AstNode[];
  sourceLine: number;
  details?: string;
  args?: unknown[];
  chainedPromises?: CallbackRecord[];
}

export class JsEventLoopEngine {
  private rawCode: string;
  private steps: SimulationStep[] = [];
  private terminalLogs: TerminalLog[] = [];
  private stepCounter = 0;
  private tasksExecuted = 0;
  private microtasksExecuted = 0;
  private loopCycle = 0;

  // Queues
  private callStack: StackFrame[] = [];
  private taskQueue: CallbackRecord[] = []; // Macrotask Queue (setTimeout, setInterval)
  private microtaskQueue: CallbackRecord[] = []; // Microtask Queue (Promise.then, queueMicrotask)
  private rafQueue: CallbackRecord[] = []; // requestAnimationFrame Queue

  // Declared user functions registry
  private functionRegistry = new Map<string, { body: AstNode | AstNode[]; params: string[]; isAsync?: boolean }>();

  private currentPhase: BrowserEventLoopPhase = 'idle';
  private currentPhaseStepIndex = 0; // 0: Evaluate Script, 1: Run a Task, 2: Run all Microtasks, 3: Rerender

  constructor(code: string) {
    this.rawCode = code;
  }

  public simulate(): { steps: SimulationStep[]; error?: string } {
    try {
      this.steps = [];
      this.terminalLogs = [];
      this.callStack = [];
      this.taskQueue = [];
      this.microtaskQueue = [];
      this.rafQueue = [];
      this.functionRegistry.clear();
      this.stepCounter = 0;
      this.tasksExecuted = 0;
      this.microtasksExecuted = 0;
      this.loopCycle = 1;
      this.currentPhase = 'evaluate_script';
      this.currentPhaseStepIndex = 0;

      // 1. Parse AST with acorn
      const ast = acorn.parse(this.rawCode, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true,
      }) as unknown as AstNode;

      // Initial Step
      this.recordStep('Event Loop initialized. Ready to execute script.', 1);

      // Phase 1: Evaluate Script (Push main script to Call Stack)
      this.currentPhase = 'evaluate_script';
      this.currentPhaseStepIndex = 0;
      this.pushStack('main()', '<script>');
      this.recordStep('1. Evaluate Script: Main script pushed to Call Stack', 1);

      // Hoist and collect function declarations first
      if (ast.body && Array.isArray(ast.body)) {
        for (const statement of ast.body) {
          if (statement.type === 'FunctionDeclaration' && statement.id?.name) {
            const funcName = statement.id.name;
            const params = (statement.params || []).map((p: AstNode) => p.name || 'arg');
            this.functionRegistry.set(funcName, {
              body: statement.body as AstNode,
              params,
              isAsync: statement.async,
            });
          }
        }
      }

      // Execute synchronous statements
      if (ast.body && Array.isArray(ast.body)) {
        for (const statement of ast.body) {
          if (statement.type !== 'FunctionDeclaration') {
            this.executeNode(statement);
          }
        }
      }

      // Pop main script from Call Stack
      this.popStack();
      this.recordStep('Synchronous script evaluation finished. Main script popped from Call Stack.', undefined);

      // Phase 2: Run Microtasks (immediately after script finishes)
      this.drainMicrotasks();

      // Phase 3: Loop while tasks or microtasks remain
      let safetyCounter = 0;
      while ((this.taskQueue.length > 0 || this.microtaskQueue.length > 0 || this.rafQueue.length > 0) && safetyCounter < 100) {
        safetyCounter++;
        this.loopCycle++;

        // 3a. Run Oldest Task from Task Queue (Macrotask)
        if (this.taskQueue.length > 0) {
          this.currentPhase = 'run_task';
          this.currentPhaseStepIndex = 1;
          const currentTask = this.taskQueue.shift()!;
          this.tasksExecuted++;

          this.recordStep(`2. Run a Task: Event Loop picks "${currentTask.name}" from Task Queue`, currentTask.sourceLine);

          // Push callback to Call Stack
          this.pushStack(currentTask.name, `line ${currentTask.sourceLine}`);
          this.recordStep(`"${currentTask.name}" pushed to Call Stack for execution`, currentTask.sourceLine);

          // Execute callback body
          if (currentTask.bodyNode) {
            this.executeNode(currentTask.bodyNode);
          }

          // Pop from stack
          this.popStack();
          this.recordStep(`"${currentTask.name}" completed and popped from Call Stack`, currentTask.sourceLine);

          // Check chained promises if any
          if (currentTask.chainedPromises && currentTask.chainedPromises.length > 0) {
            for (const chain of currentTask.chainedPromises) {
              this.microtaskQueue.push(chain);
            }
          }

          // 3b. Drain all Microtasks queued during or after this task!
          this.drainMicrotasks();
        }

        // 3c. Check Rerender / requestAnimationFrame Phase
        if (this.rafQueue.length > 0) {
          this.currentPhase = 'rerender';
          this.currentPhaseStepIndex = 3;
          this.recordStep('4. Rerender: Browser render step starting (requestAnimationFrame callbacks)', undefined);

          const rafTasks = [...this.rafQueue];
          this.rafQueue = [];

          for (const rafTask of rafTasks) {
            this.pushStack(rafTask.name, `line ${rafTask.sourceLine}`);
            this.recordStep(`requestAnimationFrame callback "${rafTask.name}" executing`, rafTask.sourceLine);
            if (rafTask.bodyNode) {
              this.executeNode(rafTask.bodyNode);
            }
            this.popStack();
            this.recordStep(`"${rafTask.name}" completed`, rafTask.sourceLine);
          }

          this.recordStep('4. Rerender: Browser paint and layout complete.', undefined);
          this.drainMicrotasks();
        } else if (this.taskQueue.length > 0 || this.microtaskQueue.length > 0) {
          // Standard render checkpoint
          this.currentPhase = 'rerender';
          this.currentPhaseStepIndex = 3;
          this.recordStep('4. Rerender: Browser UI render checkpoint complete.', undefined);
        }
      }

      // Finish Step
      this.currentPhase = 'finish';
      this.currentPhaseStepIndex = 0;
      this.recordStep('Event Loop cycle complete: All queues drained and call stack is empty.', undefined);

      return { steps: this.steps };
    } catch (e: unknown) {
      return {
        steps: this.steps,
        error: e instanceof Error ? e.message : 'Syntax or evaluation error in simulation.',
      };
    }
  }

  // Drain all microtasks completely before advancing
  private drainMicrotasks(): void {
    if (this.microtaskQueue.length === 0) return;

    this.currentPhase = 'run_microtasks';
    this.currentPhaseStepIndex = 2;
    this.recordStep('3. Run all Microtasks: Event Loop draining Microtask Queue...', undefined);

    let microSafety = 0;
    while (this.microtaskQueue.length > 0 && microSafety < 50) {
      microSafety++;
      const micro = this.microtaskQueue.shift()!;
      this.microtasksExecuted++;

      this.pushStack(micro.name, `line ${micro.sourceLine}`);
      this.recordStep(`Microtask "${micro.name}" executing on Call Stack`, micro.sourceLine);

      if (micro.bodyNode) {
        this.executeNode(micro.bodyNode);
      }

      this.popStack();
      this.recordStep(`Microtask "${micro.name}" completed and popped`, micro.sourceLine);

      // If microtask had chained promises (.then chaining)
      if (micro.chainedPromises && micro.chainedPromises.length > 0) {
        for (const chain of micro.chainedPromises) {
          this.microtaskQueue.push(chain);
          this.recordStep(`Chained microtask "${chain.name}" added to Microtask Queue`, chain.sourceLine);
        }
      }
    }
  }

  // Execute AST node recursively
  private executeNode(node: AstNode | AstNode[] | undefined): void {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const item of node) {
        this.executeNode(item);
      }
      return;
    }

    const line = node.loc?.start?.line;

    switch (node.type) {
      case 'ExpressionStatement':
        if (node.expression) {
          this.executeNode(node.expression);
        }
        break;

      case 'BlockStatement':
        if (node.body && Array.isArray(node.body)) {
          for (const stmt of node.body) {
            this.executeNode(stmt);
          }
        }
        break;

      case 'VariableDeclaration':
        if (node.declarations && Array.isArray(node.declarations)) {
          for (const decl of node.declarations) {
            if (decl.init) {
              if (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression') {
                const varName = decl.id?.name || 'anonymous';
                const params = (decl.init.params || []).map((p: AstNode) => p.name || 'arg');
                this.functionRegistry.set(varName, {
                  body: decl.init.body as AstNode,
                  params,
                  isAsync: decl.init.async,
                });
              } else {
                this.executeNode(decl.init);
              }
            }
          }
        }
        break;

      case 'CallExpression':
        this.handleCallExpression(node, line);
        break;

      case 'AwaitExpression':
        this.handleAwaitExpression(node, line);
        break;

      default:
        break;
    }
  }

  private handleCallExpression(node: AstNode, line?: number): void {
    const callee = node.callee;
    if (!callee) return;

    // 1. console.log / console.info / console.warn / console.error
    if (
      callee.type === 'MemberExpression' &&
      callee.object?.name === 'console' &&
      callee.property?.name
    ) {
      const logType = callee.property.name as 'log' | 'warn' | 'error' | 'info';
      const msg = this.resolveArgsToString(node.arguments || []);
      
      this.pushStack(`console.${logType}()`, line ? `line ${line}` : undefined, line);
      this.terminalLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: logType,
        message: msg,
        timestamp: new Date().toISOString().substring(11, 19),
        line,
      });
      this.recordStep(`console.${logType}("${msg}") executed`, line);
      this.popStack();
      return;
    }

    // 2. setTimeout(cb, delay) & setInterval(cb, delay)
    if (callee.type === 'Identifier' && (callee.name === 'setTimeout' || callee.name === 'setInterval')) {
      const isInterval = callee.name === 'setInterval';
      const cbArg = node.arguments?.[0];
      const delayArg = node.arguments?.[1];
      const delay = delayArg?.value ? Number(delayArg.value) : 0;

      let callbackName = isInterval ? 'setInterval callback' : 'setTimeout callback';
      let bodyNode: AstNode | AstNode[] | undefined;

      if (cbArg) {
        if (cbArg.type === 'Identifier' && cbArg.name) {
          callbackName = `${cbArg.name}()`;
          const reg = this.functionRegistry.get(cbArg.name);
          if (reg) bodyNode = reg.body;
        } else if (cbArg.type === 'ArrowFunctionExpression' || cbArg.type === 'FunctionExpression') {
          callbackName = isInterval ? 'setInterval(() => ...)' : 'setTimeout(() => ...)';
          bodyNode = cbArg.body;
        }
      }

      this.pushStack(`${callee.name}()`, line ? `line ${line}` : undefined, line);
      this.recordStep(`Web API timer registered: ${callee.name}(${callbackName}, ${delay}ms)`, line);

      this.taskQueue.push({
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: callbackName,
        type: 'timer',
        delay,
        bodyNode,
        sourceLine: line || 1,
        details: `${delay}ms delay`,
      });

      this.recordStep(`"${callbackName}" placed into Task Queue (Macrotask)`, line);
      this.popStack();
      return;
    }

    // 3. queueMicrotask(cb)
    if (callee.type === 'Identifier' && callee.name === 'queueMicrotask') {
      const cbArg = node.arguments?.[0];
      let cbName = 'queueMicrotask callback';
      let bodyNode: AstNode | AstNode[] | undefined;

      if (cbArg) {
        if (cbArg.type === 'Identifier' && cbArg.name) {
          cbName = `${cbArg.name}()`;
          const reg = this.functionRegistry.get(cbArg.name);
          if (reg) bodyNode = reg.body;
        } else if (cbArg.type === 'ArrowFunctionExpression' || cbArg.type === 'FunctionExpression') {
          cbName = 'queueMicrotask(() => ...)';
          bodyNode = cbArg.body;
        }
      }

      this.pushStack('queueMicrotask()', line ? `line ${line}` : undefined, line);
      this.microtaskQueue.push({
        id: `micro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: cbName,
        type: 'microtask',
        delay: 0,
        bodyNode,
        sourceLine: line || 1,
        details: 'queueMicrotask',
      });
      this.recordStep(`"${cbName}" queued in Microtask Queue`, line);
      this.popStack();
      return;
    }

    // 4. requestAnimationFrame(cb)
    if (callee.type === 'Identifier' && callee.name === 'requestAnimationFrame') {
      const cbArg = node.arguments?.[0];
      let cbName = 'requestAnimationFrame callback';
      let bodyNode: AstNode | AstNode[] | undefined;

      if (cbArg) {
        if (cbArg.type === 'Identifier' && cbArg.name) {
          cbName = `${cbArg.name}()`;
          const reg = this.functionRegistry.get(cbArg.name);
          if (reg) bodyNode = reg.body;
        } else if (cbArg.type === 'ArrowFunctionExpression' || cbArg.type === 'FunctionExpression') {
          cbName = 'rAF(() => ...)';
          bodyNode = cbArg.body;
        }
      }

      this.pushStack('requestAnimationFrame()', line ? `line ${line}` : undefined, line);
      this.rafQueue.push({
        id: `raf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: cbName,
        type: 'raf',
        delay: 16,
        bodyNode,
        sourceLine: line || 1,
        details: 'Before Paint',
      });
      this.recordStep(`"${cbName}" registered for next Render / Paint phase`, line);
      this.popStack();
      return;
    }

    // 5. Promise.resolve().then(...) or Chained Promises
    if (
      callee.type === 'MemberExpression' &&
      (callee.property?.name === 'then' || callee.property?.name === 'catch' || callee.property?.name === 'finally')
    ) {
      this.handlePromiseThen(node, line);
      return;
    }

    // 6. User declared function invocation: logA(), fetchData(), etc.
    if (callee.type === 'Identifier' && callee.name) {
      const funcName = callee.name;
      const reg = this.functionRegistry.get(funcName);

      this.pushStack(`${funcName}()`, line ? `line ${line}` : undefined, line);
      this.recordStep(`Function "${funcName}()" called on Call Stack`, line);

      if (reg && reg.body) {
        if (reg.isAsync) {
          this.recordStep(`Async function "${funcName}()" executing synchronously until first await`, line);
        }
        this.executeNode(reg.body);
      }

      this.popStack();
      this.recordStep(`Function "${funcName}()" returned and popped from Call Stack`, line);
      return;
    }
  }

  private handlePromiseThen(node: AstNode, line?: number): void {
    const cbArg = node.arguments?.[0];
    let callbackName = 'Promise.then callback';
    let bodyNode: AstNode | AstNode[] | undefined;

    if (cbArg) {
      if (cbArg.type === 'Identifier' && cbArg.name) {
        callbackName = `${cbArg.name}()`;
        const reg = this.functionRegistry.get(cbArg.name);
        if (reg) bodyNode = reg.body;
      } else if (cbArg.type === 'ArrowFunctionExpression' || cbArg.type === 'FunctionExpression') {
        callbackName = 'Promise.then(() => ...)';
        bodyNode = cbArg.body;
      }
    }

    this.pushStack('Promise.resolve().then()', line ? `line ${line}` : undefined, line);
    this.recordStep('Promise resolved: queuing microtask handler', line);

    this.microtaskQueue.push({
      id: `micro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: callbackName,
      type: 'promise',
      delay: 0,
      bodyNode,
      sourceLine: line || 1,
      details: 'Promise.then',
    });

    this.recordStep(`"${callbackName}" placed into Microtask Queue`, line);
    this.popStack();
  }

  private handleAwaitExpression(node: AstNode, line?: number): void {
    this.pushStack('await Promise', line ? `line ${line}` : undefined, line);
    this.recordStep('await encountered: yielding execution back to caller and queuing resumption microtask', line);
    this.popStack();

    this.microtaskQueue.push({
      id: `micro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: 'async resume (Microtask)',
      type: 'promise',
      delay: 0,
      bodyNode: undefined,
      sourceLine: line || 1,
      details: 'await resumption',
    });
  }

  private resolveArgsToString(args: AstNode[]): string {
    if (!args || args.length === 0) return '';
    return args
      .map(arg => {
        if (arg.value !== undefined) return String(arg.value);
        if (arg.type === 'Identifier' && arg.name) return arg.name;
        if (arg.type === 'TemplateLiteral' && arg.quasis) {
          return arg.quasis.map(q => q.value?.raw || '').join('');
        }
        return '[Object]';
      })
      .join(' ');
  }

  private pushStack(name: string, location?: string, line?: number): void {
    this.callStack.push({
      id: `frame-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      location,
      line,
    });
  }

  private popStack(): void {
    this.callStack.pop();
  }

  private recordStep(description: string, activeLine?: number): void {
    this.stepCounter++;
    this.steps.push({
      stepIndex: this.stepCounter,
      description,
      activeLine,
      callStack: JSON.parse(JSON.stringify(this.callStack)),
      taskQueue: this.taskQueue.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        details: t.details,
        delay: t.delay,
        addedAtStep: this.stepCounter,
        sourceLine: t.sourceLine,
      })),
      microtaskQueue: this.microtaskQueue.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        details: m.details,
        delay: m.delay,
        addedAtStep: this.stepCounter,
        sourceLine: m.sourceLine,
      })),
      rafQueue: this.rafQueue.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        details: r.details,
        delay: r.delay,
        addedAtStep: this.stepCounter,
        sourceLine: r.sourceLine,
      })),
      phase: this.currentPhase,
      phaseStepIndex: this.currentPhaseStepIndex,
      rerenderState: this.currentPhase === 'rerender' ? 'rendering' : 'idle',
      terminalLogs: JSON.parse(JSON.stringify(this.terminalLogs)),
      metrics: {
        loopCycle: this.loopCycle,
        tasksExecuted: this.tasksExecuted,
        microtasksExecuted: this.microtasksExecuted,
        tasksWaiting: this.taskQueue.length + this.microtaskQueue.length + this.rafQueue.length,
      },
    });
  }
}
