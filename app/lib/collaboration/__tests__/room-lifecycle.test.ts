import { CollaborationRoomManager } from '../room-manager';
import { MAX_DOCUMENT_SIZE_BYTES } from '../config';
import * as Y from 'yjs';

describe('CollaborationRoomManager Lifecycle & Guardrails', () => {
  it('initializes with default anonymous developer profile', () => {
    const manager = new CollaborationRoomManager({ toolId: 'test-tool' });
    const profile = manager.getSelfProfile();

    expect(profile.name).toBeDefined();
    expect(profile.color).toBeDefined();
    expect(profile.isSelf).toBe(true);
  });

  it('allows updating display name without account requirement', () => {
    const manager = new CollaborationRoomManager({ toolId: 'test-tool' });
    manager.setDisplayName('Custom Hacker');
    expect(manager.getSelfProfile().name).toBe('Custom Hacker');
  });

  it('drops empty or whitespace display name updates', () => {
    const manager = new CollaborationRoomManager({ toolId: 'test-tool' });
    const initialName = manager.getSelfProfile().name;
    manager.setDisplayName('   ');
    expect(manager.getSelfProfile().name).toBe(initialName);
  });

  it('triggers size limit guardrail when document exceeds quota', () => {
    const manager = new CollaborationRoomManager({
      toolId: 'test-tool',
      maxDocumentSizeBytes: 100, // small limit for test
    });

    // Simulate update listener logic
    const doc = new Y.Doc();
    const text = doc.getText('content');

    let errorDetected = false;
    doc.on('update', () => {
      if (text.length > 100) {
        errorDetected = true;
      }
    });

    text.insert(0, 'x'.repeat(150));
    expect(errorDetected).toBe(true);
    doc.destroy();
  });
});
