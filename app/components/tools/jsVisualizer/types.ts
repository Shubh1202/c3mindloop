export type BrowserEventLoopPhase = 
  | 'idle'
  | 'evaluate_script'
  | 'run_task'
  | 'run_microtasks'
  | 'rerender'
  | 'finish';

export type TaskType = 'task' | 'microtask' | 'raf' | 'timer' | 'promise';

export interface QueuedItem {
  id: string;
  name: string;
  type: TaskType;
  details?: string;
  delay?: number;
  addedAtStep: number;
  sourceLine?: number;
}

export interface StackFrame {
  id: string;
  name: string;
  location?: string;
  line?: number;
}

export interface TerminalLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
  line?: number;
}

export interface SimulationStep {
  stepIndex: number;
  description: string;
  activeLine?: number;
  callStack: StackFrame[];
  taskQueue: QueuedItem[]; // Macrotasks (setTimeout, setInterval, I/O)
  microtaskQueue: QueuedItem[]; // Microtasks (Promise.then, queueMicrotask)
  rafQueue: QueuedItem[]; // requestAnimationFrame callbacks
  phase: BrowserEventLoopPhase;
  phaseStepIndex: number; // 0: Evaluate Script, 1: Run a Task, 2: Run all Microtasks, 3: Rerender
  rerenderState: 'idle' | 'rendering' | 'completed';
  terminalLogs: TerminalLog[];
  metrics: {
    loopCycle: number;
    tasksExecuted: number;
    microtasksExecuted: number;
    tasksWaiting: number;
  };
}

export interface PresetScript {
  id: string;
  name: string;
  description: string;
  code: string;
}
