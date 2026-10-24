import { computeStringDiff } from '../hooks/useCollaborativeText';

describe('computeStringDiff string diffing', () => {
  it('correctly detects pure insertion at end', () => {
    const diff = computeStringDiff('hello', 'hello world');
    expect(diff).toEqual({
      index: 5,
      deleteCount: 0,
      insertText: ' world',
    });
  });

  it('correctly detects pure insertion at start', () => {
    const diff = computeStringDiff('world', 'hello world');
    expect(diff).toEqual({
      index: 0,
      deleteCount: 0,
      insertText: 'hello ',
    });
  });

  it('correctly detects insertion in the middle', () => {
    const diff = computeStringDiff('ac', 'abc');
    expect(diff).toEqual({
      index: 1,
      deleteCount: 0,
      insertText: 'b',
    });
  });

  it('correctly detects deletion from middle', () => {
    const diff = computeStringDiff('abcdef', 'abef');
    expect(diff).toEqual({
      index: 2,
      deleteCount: 2,
      insertText: '',
    });
  });

  it('correctly detects replacement in middle', () => {
    const diff = computeStringDiff('foo bar baz', 'foo qux baz');
    expect(diff).toEqual({
      index: 4,
      deleteCount: 3,
      insertText: 'qux',
    });
  });

  it('returns no-op when strings are identical', () => {
    const diff = computeStringDiff('exact same', 'exact same');
    expect(diff).toEqual({
      index: 10,
      deleteCount: 0,
      insertText: '',
    });
  });
});
