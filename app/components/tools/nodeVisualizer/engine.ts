import * as acorn from 'acorn';
import { SimulationStep, StackFrame, QueuedTask, TerminalLog, EventLoopPhase, MicrotaskSubPhase } from './types';

// Structured AST Node definition
interface AstNode {
  type: string;
  name?: string;
  value?: unknown;
  operator?: string;
  left?: AstNode;
  right?: AstNode;
  quasis?: { value: { raw: string } }[];
  loc?: { start: { line: number; column: number } };
  expression?: AstNode;
  declarations?: { id?: AstNode; init?: AstNode }[];
  body?: AstNode[] | AstNode;
  consequent?: AstNode;
  callee?: AstNode;
  arguments?: AstNode[];
  object?: AstNode;
  property?: AstNode;
  id?: AstNode;
}

interface CallbackRecord {
  id: string;
  name: string;
  type: 'timer' | 'immediate' | 'io' | 'nextTick' | 'promise' | 'microtask' | 'close';
  delay: number;
  bodyNode: AstNode | undefined;
  sourceLine: number;
  details?: string;
  args?: unknown[];
}

export class EventLoopEngine {
  private rawCode: string;
  private isESM: boolean;
  private steps: SimulationStep[] = [];
  private terminalLogs: TerminalLog[] = [];
  private stepCounter = 0;
  private eventCounter = 0;
  private loopCounter = 0;

  // Queues
  private callStack: StackFrame[] = [];
  private timerQueue: CallbackRecord[] = [];
  private checkQueue: CallbackRecord[] = [];
  private ioQueue: CallbackRecord[] = [];
  private nextTickQueue: CallbackRecord[] = [];
  private microtaskQueue: CallbackRecord[] = [];
  private closeQueue: CallbackRecord[] = [];

  private currentPhase: EventLoopPhase = 'start';
  private currentMicroPhase: MicrotaskSubPhase = 'idle';

  constructor(code: string, isESM: boolean = false) {
    this.rawCode = code;
    this.isESM = isESM;
  }

  public simulate(): { steps: SimulationStep[]; error?: string } {
    try {
      this.steps = [];
      this.terminalLogs = [];
      this.callStack = [];
      this.timerQueue = [];
      this.checkQueue = [];
      this.ioQueue = [];
      this.nextTickQueue = [];
      this.microtaskQueue = [];
      this.closeQueue = [];
      this.stepCounter = 0;
      this.eventCounter = 0;
      this.loopCounter = 0;
      this.currentPhase = 'start';
      this.currentMicroPhase = 'idle';

      // Parse code with acorn
      const sourceType = this.isESM ? 'module' : 'script';
      const ast = acorn.parse(this.rawCode, {
        ecmaVersion: 'latest',
        sourceType,
        locations: true,
      }) as unknown as AstNode;

      // Initial Frame
      this.recordStep('Initializing Node.js runtime environment...', undefined);

      // Phase: Main Script Execution on Call Stack
      this.currentPhase = 'start';
      this.pushStack('main()', '<anonymous>');
      this.recordStep('Main script pushed to Call Stack', 1);

      // Execute top-level body statements
      if (ast.body && Array.isArray(ast.body)) {
        for (const statement of ast.body) {
          this.executeNode(statement);
        }
      }

      this.popStack();
      this.recordStep('Main script execution completed. Call Stack is empty.', undefined);

      // Drain Initial Microtasks before starting event loop
      this.drainMicrotasks('Start of Event Loop');

      // Loop until all queues are empty or max steps reached (safeguard)
      let maxLoops = 25;
      while (this.hasPendingWork() && maxLoops > 0) {
        maxLoops--;
        this.loopCounter++;

        // Phase 1: Timers
        this.currentPhase = 'timers';
        this.recordStep('Event Loop entered "Timers" phase', undefined);
        this.processTimersPhase();
        this.drainMicrotasks('Timers phase');

        // Phase 2: Pending Callbacks
        this.currentPhase = 'pending';
        this.recordStep('Event Loop entered "Pending Callbacks" phase', undefined);

        // Phase 3: Idle / Prepare
        this.currentPhase = 'idle_prepare';
        this.recordStep('Event Loop entered "Idle - Prepare" phase (internal libuv operations)', undefined);

        // Phase 4: Poll (I/O)
        this.currentPhase = 'poll';
        this.recordStep('Event Loop entered "Poll" phase (I/O callbacks)', undefined);
        this.processIoPhase();
        this.drainMicrotasks('Poll phase');

        // Phase 5: Check (setImmediate)
        this.currentPhase = 'check';
        this.recordStep('Event Loop entered "Check" phase (setImmediate)', undefined);
        this.processCheckPhase();
        this.drainMicrotasks('Check phase');

        // Phase 6: Close Callbacks
        this.currentPhase = 'close';
        this.recordStep('Event Loop entered "Close Callbacks" phase', undefined);
        this.processClosePhase();
        this.drainMicrotasks('Close Callbacks phase');
      }

      // Finish Phase
      this.currentPhase = 'finish';
      this.currentMicroPhase = 'finish';
      this.recordStep('All queues drained. Node.js process exiting successfully.', undefined);

      return { steps: this.steps };
    } catch (err: unknown) {
      return { steps: this.steps, error: err instanceof Error ? err.message : 'Execution error' };
    }
  }

  private hasPendingWork(): boolean {
    return (
      this.timerQueue.length > 0 ||
      this.checkQueue.length > 0 ||
      this.ioQueue.length > 0 ||
      this.nextTickQueue.length > 0 ||
      this.microtaskQueue.length > 0 ||
      this.closeQueue.length > 0
    );
  }

  private executeNode(node?: AstNode) {
    if (!node) return;
    const line = node.loc ? node.loc.start.line : undefined;

    switch (node.type) {
      case 'ExpressionStatement':
        this.executeExpression(node.expression, line);
        break;

      case 'VariableDeclaration':
        this.recordStep(`Variable declaration: ${this.getNodeSummary(node)}`, line);
        if (node.declarations) {
          for (const decl of node.declarations) {
            if (decl.init) {
              this.executeExpression(decl.init, line);
            }
          }
        }
        break;

      case 'FunctionDeclaration':
        this.recordStep(`Function defined: ${node.id ? node.id.name : 'anonymous'}()`, line);
        break;

      case 'BlockStatement':
        if (Array.isArray(node.body)) {
          for (const stmt of node.body) {
            this.executeNode(stmt);
          }
        }
        break;

      case 'IfStatement':
        this.recordStep(`Evaluating conditional statement`, line);
        if (node.consequent) this.executeNode(node.consequent);
        break;

      default:
        break;
    }
  }

  private executeExpression(expr?: AstNode, line?: number) {
    if (!expr) return;

    if (expr.type === 'CallExpression') {
      this.handleCallExpression(expr, line);
    } else if (expr.type === 'AwaitExpression') {
      this.handleAwaitExpression(expr, line);
    }
  }

  private handleCallExpression(callExpr: AstNode, line?: number) {
    const callee = callExpr.callee;
    const args = callExpr.arguments || [];
    if (!callee) return;

    // 1. console.log / console.warn / console.error
    if (
      callee.type === 'MemberExpression' &&
      callee.object?.name === 'console' &&
      callee.property?.name
    ) {
      const method = callee.property.name as 'log' | 'warn' | 'error' | 'info';
      const logMessage = args
        .map((a) => this.evaluateLiteralOrIdentifier(a))
        .join(' ');

      this.pushStack(`console.${method}()`, `line ${line || 1}`);
      this.recordStep(`Executing console.${method}("${logMessage}")`, line);

      this.addLog(method, logMessage, line);
      this.eventCounter++;

      this.popStack();
      this.recordStep(`console.${method}() returned`, line);
      return;
    }

    // 2. setTimeout(cb, delay)
    if (callee.type === 'Identifier' && callee.name === 'setTimeout') {
      const cbArg = args[0];
      const delayArg = args[1];
      const delay = delayArg ? this.evaluateLiteralNumber(delayArg) : 0;

      this.pushStack(`setTimeout(cb, ${delay}ms)`, `line ${line || 1}`);
      this.recordStep(`Registering Timer with ${delay}ms delay in Macrotask queue`, line);

      this.timerQueue.push({
        id: `timer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `setTimeout callback (${delay}ms)`,
        type: 'timer',
        delay,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: `${delay}ms delay`,
      });

      this.popStack();
      this.recordStep(`Timer scheduled in Timers Queue`, line);
      return;
    }

    // 3. setInterval(cb, delay)
    if (callee.type === 'Identifier' && callee.name === 'setInterval') {
      const cbArg = args[0];
      const delayArg = args[1];
      const delay = delayArg ? this.evaluateLiteralNumber(delayArg) : 0;

      this.pushStack(`setInterval(cb, ${delay}ms)`, `line ${line || 1}`);
      this.timerQueue.push({
        id: `interval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `setInterval callback (${delay}ms)`,
        type: 'timer',
        delay,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: `${delay}ms interval`,
      });
      this.popStack();
      this.recordStep(`Interval scheduled in Timers Queue`, line);
      return;
    }

    // 4. setImmediate(cb)
    if (callee.type === 'Identifier' && callee.name === 'setImmediate') {
      const cbArg = args[0];
      this.pushStack(`setImmediate(cb)`, `line ${line || 1}`);
      this.recordStep(`Registering setImmediate callback in Check queue`, line);

      this.checkQueue.push({
        id: `immediate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `setImmediate callback`,
        type: 'immediate',
        delay: 0,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: 'Check Phase',
      });

      this.popStack();
      this.recordStep(`setImmediate queued for Check Phase`, line);
      return;
    }

    // 5. process.nextTick(cb)
    if (
      callee.type === 'MemberExpression' &&
      callee.object?.name === 'process' &&
      callee.property?.name === 'nextTick'
    ) {
      const cbArg = args[0];
      this.pushStack(`process.nextTick(cb)`, `line ${line || 1}`);
      this.recordStep(`Adding callback to process.nextTick priority queue`, line);

      this.nextTickQueue.push({
        id: `nextTick-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `process.nextTick callback`,
        type: 'nextTick',
        delay: 0,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: 'High Priority Microtask',
      });

      this.popStack();
      this.recordStep(`process.nextTick queued (runs before Promise microtasks)`, line);
      return;
    }

    // 6. queueMicrotask(cb)
    if (callee.type === 'Identifier' && callee.name === 'queueMicrotask') {
      const cbArg = args[0];
      this.pushStack(`queueMicrotask(cb)`, `line ${line || 1}`);
      this.microtaskQueue.push({
        id: `microtask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `queueMicrotask callback`,
        type: 'microtask',
        delay: 0,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: 'Microtask Queue',
      });
      this.popStack();
      this.recordStep(`queueMicrotask queued in Microtask Queue`, line);
      return;
    }

    // 7. Promise.resolve().then(...) or new Promise(...)
    if (
      callee.type === 'MemberExpression' &&
      callee.property?.name === 'then'
    ) {
      const cbArg = args[0];
      this.pushStack(`Promise.then(cb)`, `line ${line || 1}`);
      this.recordStep(`Promise resolved. Queuing .then() handler to Microtask Queue`, line);

      this.microtaskQueue.push({
        id: `promise-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `Promise.then callback`,
        type: 'promise',
        delay: 0,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: 'Promise Resolution',
      });

      this.popStack();
      this.recordStep(`Promise handler pushed to Microtask Queue`, line);
      return;
    }

    // 8. fs.readFile(..., cb) simulation
    if (
      callee.type === 'MemberExpression' &&
      callee.object?.name === 'fs' &&
      (callee.property?.name === 'readFile' || callee.property?.name === 'readdir')
    ) {
      const cbArg = args[args.length - 1];
      const fileName = this.evaluateLiteralOrIdentifier(args[0]) || 'file.txt';

      this.pushStack(`fs.${callee.property.name}("${fileName}")`, `line ${line || 1}`);
      this.recordStep(`Dispatching async file system I/O request to libuv worker pool`, line);

      this.ioQueue.push({
        id: `io-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `fs.${callee.property.name} callback ("${fileName}")`,
        type: 'io',
        delay: 0,
        bodyNode: cbArg,
        sourceLine: line || 1,
        details: 'I/O Poll Phase',
      });

      this.popStack();
      this.recordStep(`File I/O dispatched. Callback will run in Poll phase`, line);
      return;
    }

    // Default unknown function call
    const funcName = this.getNodeSummary(callee);
    this.pushStack(`${funcName}()`, `line ${line || 1}`);
    this.recordStep(`Calling ${funcName}()`, line);
    this.popStack();
  }

  private handleAwaitExpression(awaitExpr: AstNode, line?: number) {
    this.recordStep(`Encountered await expression: queuing remaining execution to Microtask Queue`, line);
  }

  private drainMicrotasks(context: string) {
    let drainedAny = false;

    while (this.nextTickQueue.length > 0 || this.microtaskQueue.length > 0) {
      drainedAny = true;

      // 1. Drain process.nextTick first
      while (this.nextTickQueue.length > 0) {
        this.currentMicroPhase = 'next_tick';
        const task = this.nextTickQueue.shift()!;
        this.eventCounter++;

        this.pushStack(`nextTickCallback()`, `from line ${task.sourceLine}`);
        this.recordStep(`[Ticks & Rejections] Running process.nextTick callback: ${task.name}`, task.sourceLine);

        this.executeCallbackBody(task.bodyNode);

        this.popStack();
        this.recordStep(`[Ticks & Rejections] Completed process.nextTick callback`, undefined);
      }

      // 2. Drain Promise microtasks
      while (this.microtaskQueue.length > 0) {
        this.currentMicroPhase = 'micro_tasks';
        const task = this.microtaskQueue.shift()!;
        this.eventCounter++;

        this.pushStack(`promiseMicrotask()`, `from line ${task.sourceLine}`);
        this.recordStep(`[Ticks & Rejections] Running Microtask callback: ${task.name}`, task.sourceLine);

        this.executeCallbackBody(task.bodyNode);

        this.popStack();
        this.recordStep(`[Ticks & Rejections] Completed Microtask callback`, undefined);

        // If a microtask scheduled a nextTick, break out to drain nextTick first
        if (this.nextTickQueue.length > 0) {
          break;
        }
      }
    }

    if (drainedAny) {
      this.currentMicroPhase = 'finish';
      this.recordStep(`Microtask queues fully drained for ${context}`, undefined);
    }
    this.currentMicroPhase = 'idle';
  }

  private processTimersPhase() {
    if (this.timerQueue.length === 0) {
      this.recordStep('Timers phase: No expired timers in queue', undefined);
      return;
    }

    // Sort by delay
    this.timerQueue.sort((a, b) => a.delay - b.delay);
    const tasksToRun = [...this.timerQueue];
    this.timerQueue = [];

    for (const task of tasksToRun) {
      this.eventCounter++;
      this.pushStack(`timerCallback(${task.delay}ms)`, `from line ${task.sourceLine}`);
      this.recordStep(`[Timers Phase] Executing timer callback: ${task.name}`, task.sourceLine);

      this.executeCallbackBody(task.bodyNode);

      this.popStack();
      this.recordStep(`[Timers Phase] Completed timer callback (${task.name})`, undefined);

      // Check for microtasks scheduled inside this timer
      if (this.nextTickQueue.length > 0 || this.microtaskQueue.length > 0) {
        this.drainMicrotasks('inside Timers phase');
      }
    }
  }

  private processIoPhase() {
    if (this.ioQueue.length === 0) {
      this.recordStep('Poll phase: No I/O events ready', undefined);
      return;
    }

    const tasksToRun = [...this.ioQueue];
    this.ioQueue = [];

    for (const task of tasksToRun) {
      this.eventCounter++;
      this.pushStack(`ioCallback()`, `from line ${task.sourceLine}`);
      this.recordStep(`[Poll Phase] Executing I/O callback: ${task.name}`, task.sourceLine);

      this.executeCallbackBody(task.bodyNode);

      this.popStack();
      this.recordStep(`[Poll Phase] Completed I/O callback`, undefined);

      if (this.nextTickQueue.length > 0 || this.microtaskQueue.length > 0) {
        this.drainMicrotasks('inside Poll phase');
      }
    }
  }

  private processCheckPhase() {
    if (this.checkQueue.length === 0) {
      this.recordStep('Check phase: No setImmediate callbacks queued', undefined);
      return;
    }

    const tasksToRun = [...this.checkQueue];
    this.checkQueue = [];

    for (const task of tasksToRun) {
      this.eventCounter++;
      this.pushStack(`setImmediateCallback()`, `from line ${task.sourceLine}`);
      this.recordStep(`[Check Phase] Executing setImmediate callback`, task.sourceLine);

      this.executeCallbackBody(task.bodyNode);

      this.popStack();
      this.recordStep(`[Check Phase] Completed setImmediate callback`, undefined);

      if (this.nextTickQueue.length > 0 || this.microtaskQueue.length > 0) {
        this.drainMicrotasks('inside Check phase');
      }
    }
  }

  private processClosePhase() {
    if (this.closeQueue.length === 0) {
      return;
    }
    const tasksToRun = [...this.closeQueue];
    this.closeQueue = [];
    for (const task of tasksToRun) {
      this.eventCounter++;
      this.pushStack(`closeCallback()`, `from line ${task.sourceLine}`);
      this.executeCallbackBody(task.bodyNode);
      this.popStack();
    }
  }

  private executeCallbackBody(cbNode?: AstNode) {
    if (!cbNode) return;

    if (
      cbNode.type === 'ArrowFunctionExpression' ||
      cbNode.type === 'FunctionExpression'
    ) {
      if (cbNode.body) {
        if (Array.isArray(cbNode.body)) {
          for (const stmt of cbNode.body) {
            this.executeNode(stmt);
          }
        } else if (cbNode.body.type === 'BlockStatement' && Array.isArray(cbNode.body.body)) {
          for (const stmt of cbNode.body.body) {
            this.executeNode(stmt);
          }
        } else {
          this.executeExpression(cbNode.body, cbNode.loc?.start.line);
        }
      }
    } else if (cbNode.type === 'Identifier') {
      this.recordStep(`Executing named function reference ${cbNode.name}()`, cbNode.loc?.start.line);
    }
  }

  private pushStack(name: string, location?: string) {
    this.callStack.push({
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      location,
    });
  }

  private popStack() {
    this.callStack.pop();
  }

  private addLog(type: 'log' | 'warn' | 'error' | 'info', message: string, line?: number) {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.terminalLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      message,
      timestamp: time,
      line,
    });
  }

  private recordStep(description: string, activeLine?: number) {
    this.stepCounter++;

    // Collect all macrotasks for UI view
    const macrotasks: QueuedTask[] = [
      ...this.timerQueue.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        details: t.details,
        delay: t.delay,
        addedAtStep: this.stepCounter,
      })),
      ...this.checkQueue.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        details: t.details,
        addedAtStep: this.stepCounter,
      })),
      ...this.ioQueue.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        details: t.details,
        addedAtStep: this.stepCounter,
      })),
    ];

    const microtasks: QueuedTask[] = this.microtaskQueue.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      details: t.details,
      addedAtStep: this.stepCounter,
    }));

    const nextTicks: QueuedTask[] = this.nextTickQueue.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      details: t.details,
      addedAtStep: this.stepCounter,
    }));

    const eventsWaiting = macrotasks.length + microtasks.length + nextTicks.length;

    this.steps.push({
      stepIndex: this.stepCounter,
      description,
      activeLine,
      callStack: [...this.callStack],
      macrotaskQueue: macrotasks,
      microtaskQueue: microtasks,
      nextTickQueue: nextTicks,
      phase: this.currentPhase,
      microPhase: this.currentMicroPhase,
      terminalLogs: [...this.terminalLogs],
      metrics: {
        loopCount: this.loopCounter,
        events: this.eventCounter,
        eventsWaiting,
      },
    });
  }

  private evaluateLiteralOrIdentifier(node?: AstNode): string {
    if (!node) return '';
    if (node.type === 'Literal') return String(node.value);
    if (node.type === 'Identifier') return node.name || '';
    if (node.type === 'TemplateLiteral' && node.quasis) {
      return node.quasis.map((q) => q.value.raw).join('');
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      return `${this.evaluateLiteralOrIdentifier(node.left)}${this.evaluateLiteralOrIdentifier(node.right)}`;
    }
    return '[Expression]';
  }

  private evaluateLiteralNumber(node?: AstNode): number {
    if (!node) return 0;
    if (node.type === 'Literal' && typeof node.value === 'number') {
      return node.value;
    }
    return 0;
  }

  private getNodeSummary(node?: AstNode): string {
    if (!node) return '';
    if (node.type === 'Identifier') return node.name || '';
    if (node.type === 'MemberExpression') {
      return `${this.getNodeSummary(node.object)}.${this.getNodeSummary(node.property)}`;
    }
    if (node.type === 'VariableDeclaration' && node.declarations) {
      return node.declarations.map((d) => d.id?.name).join(', ');
    }
    return 'expression';
  }
}
