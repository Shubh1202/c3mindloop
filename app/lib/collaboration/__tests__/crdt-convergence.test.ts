import * as Y from 'yjs';
import * as fc from 'fast-check';

/**
 * Property-Based Testing for Yjs CRDT Convergence.
 * Verifies that concurrent simulated operations applied in divergent orders
 * converge to the exact same text state across all peers.
 */
describe('CRDT Text Convergence Properties', () => {
  it('converges to the exact same text when concurrent edits are merged', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 50 }),
        fc.array(
          fc.record({
            isInsert: fc.boolean(),
            text: fc.string({ minLength: 1, maxLength: 10 }),
            indexFraction: fc.double({ min: 0, max: 1, noNaN: true }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (initialText, operations) => {
          // Peer 1 and Peer 2 start with identical initial document
          const doc1 = new Y.Doc();
          const doc2 = new Y.Doc();

          const text1 = doc1.getText('content');
          const text2 = doc2.getText('content');

          if (initialText.length > 0) {
            text1.insert(0, initialText);
            const initialUpdate = Y.encodeStateAsUpdate(doc1);
            Y.applyUpdate(doc2, initialUpdate);
          }

          // Split operations: half to doc1, half to doc2
          const mid = Math.floor(operations.length / 2);
          const ops1 = operations.slice(0, mid);
          const ops2 = operations.slice(mid);

          // Apply ops1 to doc1
          for (const op of ops1) {
            const len = text1.length;
            const index = Math.min(Math.floor(op.indexFraction * len), len);
            if (op.isInsert || len === 0) {
              text1.insert(index, op.text);
            } else {
              const deleteCount = Math.min(op.text.length, len - index);
              if (deleteCount > 0) {
                text1.delete(index, deleteCount);
              }
            }
          }

          // Apply ops2 to doc2
          for (const op of ops2) {
            const len = text2.length;
            const index = Math.min(Math.floor(op.indexFraction * len), len);
            if (op.isInsert || len === 0) {
              text2.insert(index, op.text);
            } else {
              const deleteCount = Math.min(op.text.length, len - index);
              if (deleteCount > 0) {
                text2.delete(index, deleteCount);
              }
            }
          }

          // Exchange updates (simulate WebRTC sync)
          const update1 = Y.encodeStateAsUpdate(doc1);
          const update2 = Y.encodeStateAsUpdate(doc2);

          Y.applyUpdate(doc2, update1);
          Y.applyUpdate(doc1, update2);

          // CRDT Mathematical Guarantee: text1.toString() === text2.toString()
          expect(text1.toString()).toEqual(text2.toString());

          doc1.destroy();
          doc2.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
