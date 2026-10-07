import { PresetScript } from './types';

export const JS_PRESETS: PresetScript[] = [
  {
    id: 'default',
    name: 'JS Visualizer 9000 Starter',
    description: 'The classic demonstration of Call Stack, setTimeout (Task Queue), and Promise (Microtask Queue).',
    code: `function logA() { console.log('A'); }
function logB() { console.log('B'); }
function logC() { console.log('C'); }
function logD() { console.log('D'); }

// Click the "RUN" button to see how the Event Loop works!
logA();
setTimeout(logB, 0);
Promise.resolve().then(logC);
logD();

// Expected output order: A -> D -> C -> B`,
  },
  {
    id: 'microtask-vs-task',
    name: 'Microtask Queue vs Task Queue',
    description: 'Shows why Promise microtasks and queueMicrotask drain before any Task Queue item.',
    code: `console.log('1. Script start (Call Stack)');

setTimeout(() => {
  console.log('4. setTimeout callback (Task Queue / Macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('2. Promise.then callback (Microtask Queue)');
});

queueMicrotask(() => {
  console.log('3. queueMicrotask callback (Microtask Queue)');
});

console.log('5. Script end (Call Stack)');`,
  },
  {
    id: 'microtask-starvation',
    name: 'Microtask Starvation Demo',
    description: 'Demonstrates how a chain of microtasks starves the Task Queue from ever running until all microtasks finish.',
    code: `console.log('Start');

setTimeout(() => {
  console.log('Timer executed (Task Queue)');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Microtask 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Microtask 2 (Chained)');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Microtask 3 (Chained)');
  });

console.log('End');`,
  },
  {
    id: 'async-await',
    name: 'Async / Await Flow',
    description: 'Visualizes how async/await pauses function execution and schedules microtask resumption.',
    code: `async function fetchData() {
  console.log('1. Inside async function (sync)');
  await Promise.resolve();
  console.log('3. Resumed after await (Microtask)');
}

console.log('0. Script Start');
fetchData();
console.log('2. Script Continues Synchronously');`,
  },
  {
    id: 'render-raf',
    name: 'requestAnimationFrame & Render',
    description: 'Demonstrates requestAnimationFrame callback scheduling before the browser Rerender phase.',
    code: `console.log('Script started');

setTimeout(() => {
  console.log('setTimeout (Task Queue)');
}, 0);

requestAnimationFrame(() => {
  console.log('requestAnimationFrame (Before Paint)');
});

Promise.resolve().then(() => {
  console.log('Promise resolved (Microtask Queue)');
});

console.log('Script finished');`,
  },
  {
    id: 'nested-tasks',
    name: 'Nested Timers & Promises',
    description: 'Demonstrates a timer scheduling a new Promise, and a Promise scheduling a new timer.',
    code: `setTimeout(() => {
  console.log('Task 1 (setTimeout)');
  Promise.resolve().then(() => {
    console.log('Microtask inside Task 1');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('Microtask 1 (Promise)');
  setTimeout(() => {
    console.log('Task inside Microtask 1');
  }, 0);
});

console.log('Main thread done');`,
  },
];
