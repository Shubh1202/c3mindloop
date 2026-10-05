export type EventLoopPhase = 
  | 'start'
  | 'timers'
  | 'pending'
  | 'idle_prepare'
  | 'poll'
  | 'check'
  | 'close'
  | 'finish';

export type MicrotaskSubPhase = 
  | 'idle'
  | 'start'
  | 'next_tick'
  | 'micro_tasks'
  | 'finish';

export type TaskType = 'timer' | 'immediate' | 'io' | 'nextTick' | 'promise' | 'microtask' | 'close';

export interface QueuedTask {
  id: string;
  name: string;
  type: TaskType;
  details?: string;
  delay?: number;
  addedAtStep: number;
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
  macrotaskQueue: QueuedTask[];
  microtaskQueue: QueuedTask[];
  nextTickQueue: QueuedTask[];
  phase: EventLoopPhase;
  microPhase: MicrotaskSubPhase;
  terminalLogs: TerminalLog[];
  metrics: {
    loopCount: number;
    events: number;
    eventsWaiting: number;
  };
}

export interface PresetScript {
  id: string;
  name: string;
  description: string;
  codeCJS: string;
  codeESM: string;
}
