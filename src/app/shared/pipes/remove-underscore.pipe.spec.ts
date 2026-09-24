import { RemoveUnderscorePipe } from './remove-underscore.pipe';

describe('RemoveUnderscorePipe', () => {
  let pipe: RemoveUnderscorePipe;

  beforeEach(() => {
    pipe = new RemoveUnderscorePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the same value if input is empty', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('should return the same input if it contains no underscores', () => {
    const input = 'noUnderscores';
    const result = pipe.transform(input);
    expect(result).toBe(input);
  });

  it('should replace underscores with spaces', () => {
    const input = 'underscores_test';
    const expected = 'underscores test';
    const result = pipe.transform(input);
    expect(result).toBe(expected);
  });
});
