import { RemovePlaceholderPipe } from './remove-placeholder.pipe';

describe('RemovePlaceholderPipe', () => {

  it('should remove the placeholder from string', () => {
    const testString = '${test}';
    const pipe = new RemovePlaceholderPipe();
    expect(pipe.transform(testString)).toBe('test');
  });

  it('should return the same value if there is no placeholder', () => {
    const testString = 'no placeholder';
    const pipe = new RemovePlaceholderPipe();
    expect(pipe.transform(testString)).toBe('no placeholder');
  });

  it('should return the same value if value is not a string', () => {
    const testValue = 12;
    const pipe = new RemovePlaceholderPipe();
    expect(pipe.transform(testValue)).toBe(12);
    expect(typeof pipe.transform(testValue)).toBe('number');
  });
})
