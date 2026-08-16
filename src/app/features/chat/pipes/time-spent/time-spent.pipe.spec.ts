import { TimeSpentPipe } from './time-spent.pipe';

describe('TimeSpentPipe', () => {
  const pipe = new TimeSpentPipe();

  it('formats Ollama nanoseconds as hours, minutes, and seconds', () => {
    expect(pipe.transform(3_661_000_000_000)).toBe('01:01:01');
  });

  it('rounds down sub-second duration values', () => {
    expect(pipe.transform(999_999_999)).toBe('00:00:00');
  });
});
