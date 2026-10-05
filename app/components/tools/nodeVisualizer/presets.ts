import { PresetScript } from './types';

export const PRESETS: PresetScript[] = [
  {
    id: 'default',
    name: 'Default (Timers & Callbacks)',
    description: 'Basic demonstration of synchronous execution vs setTimeout timer callbacks.',
    codeCJS: `// Click the "RUN" button to learn how this works!
console.log('log 1');

setTimeout(() => {
  console.log('Timeout executed 1');
}, 700);

console.log('log 2');

// NOTE:
// This is an interactive visualization.
// Try editing this code and see what happens!
// You can also try playing with presets from the dropdown!`,
    codeESM: `// Click the "RUN" button to learn how this works!
console.log('log 1');

setTimeout(() => {
  console.log('Timeout executed 1');
}, 700);

console.log('log 2');

// ESModules standard timer demo`,
  },
  {
    id: 'microtask-vs-macrotask',
    name: 'Promise Microtask vs setTimeout',
    description: 'Demonstrates microtasks resolving before macrotask timer queues.',
    codeCJS: `console.log('1. Script start');

setTimeout(() => {
  console.log('2. setTimeout callback (Macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise.then callback (Microtask)');
});

queueMicrotask(() => {
  console.log('4. queueMicrotask callback (Microtask)');
});

console.log('5. Script end');`,
    codeESM: `console.log('1. Script start');

setTimeout(() => {
  console.log('2. setTimeout callback (Macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise.then callback (Microtask)');
});

queueMicrotask(() => {
  console.log('4. queueMicrotask callback (Microtask)');
});

console.log('5. Script end');`,
  },
  {
    id: 'nexttick-priority',
    name: 'process.nextTick vs Promise Microtask',
    description: 'Shows how process.nextTick executes before Promise microtasks on every tick.',
    codeCJS: `console.log('Start');

process.nextTick(() => {
  console.log('nextTick 1 (Highest priority microtask)');
});

Promise.resolve().then(() => {
  console.log('Promise 1 (Microtask)');
});

process.nextTick(() => {
  console.log('nextTick 2');
});

console.log('End');`,
    codeESM: `console.log('Start');

process.nextTick(() => {
  console.log('nextTick 1 (Highest priority microtask)');
});

Promise.resolve().then(() => {
  console.log('Promise 1 (Microtask)');
});

process.nextTick(() => {
  console.log('nextTick 2');
});

console.log('End');`,
  },
  {
    id: 'timer-vs-immediate',
    name: 'setImmediate vs setTimeout(0)',
    description: 'Demonstrates Check phase (setImmediate) and Timers phase (setTimeout).',
    codeCJS: `console.log('Start');

setTimeout(() => {
  console.log('Timers phase: setTimeout (0ms)');
}, 0);

setImmediate(() => {
  console.log('Check phase: setImmediate');
});

process.nextTick(() => {
  console.log('NextTick runs before both phases');
});

console.log('End of main stack');`,
    codeESM: `console.log('Start');

setTimeout(() => {
  console.log('Timers phase: setTimeout (0ms)');
}, 0);

setImmediate(() => {
  console.log('Check phase: setImmediate');
});

process.nextTick(() => {
  console.log('NextTick runs before both phases');
});

console.log('End of main stack');`,
  },
  {
    id: 'fs-io-simulation',
    name: 'I/O Polling & Callback Phase',
    description: 'Shows I/O polling cycle where setImmediate runs before setTimeout within I/O callbacks.',
    codeCJS: `const fs = require('fs');

console.log('1. Reading file...');

fs.readFile('data.txt', () => {
  console.log('2. I/O Poll callback executed');
  
  setTimeout(() => {
    console.log('3. setTimeout inside I/O');
  }, 0);
  
  setImmediate(() => {
    console.log('4. setImmediate inside I/O (runs first in Check phase!)');
  });
});

console.log('5. Synchronous stack completed');`,
    codeESM: `import fs from 'fs';

console.log('1. Reading file...');

fs.readFile('data.txt', () => {
  console.log('2. I/O Poll callback executed');
  
  setTimeout(() => {
    console.log('3. setTimeout inside I/O');
  }, 0);
  
  setImmediate(() => {
    console.log('4. setImmediate inside I/O (runs first in Check phase!)');
  });
});

console.log('5. Synchronous stack completed');`,
  },
  {
    id: 'nested-event-loop',
    name: 'Complex Nested Async Flow',
    description: 'Nested promises, timers, nextTicks, and immediate calls.',
    codeCJS: `console.log('1');

setTimeout(() => {
  console.log('2 (Timer 1)');
  process.nextTick(() => console.log('3 (nextTick in Timer 1)'));
}, 0);

Promise.resolve().then(() => {
  console.log('4 (Promise 1)');
  setTimeout(() => console.log('5 (Timer 2)'), 0);
});

process.nextTick(() => {
  console.log('6 (nextTick 1)');
  Promise.resolve().then(() => console.log('7 (Promise in nextTick)'));
});

console.log('8');`,
    codeESM: `console.log('1');

setTimeout(() => {
  console.log('2 (Timer 1)');
  process.nextTick(() => console.log('3 (nextTick in Timer 1)'));
}, 0);

Promise.resolve().then(() => {
  console.log('4 (Promise 1)');
  setTimeout(() => console.log('5 (Timer 2)'), 0);
});

process.nextTick(() => {
  console.log('6 (nextTick 1)');
  Promise.resolve().then(() => console.log('7 (Promise in nextTick)'));
});

console.log('8');`,
  },
];
