import { ReadableBooleanPipe } from './readable-boolean.pipe';

describe('readableBooleanPipe', () => {
  let pipe: ReadableBooleanPipe;

  beforeEach(() => {
    pipe = new ReadableBooleanPipe();
  });

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  describe('TRUE Scenario', () => {
    it('should return "Yes" translation key if value is "Trueish"', () => {
      const resultString = pipe.transform('true');
      const resultBoolean = pipe.transform(true);
      expect(resultString).toBe('common.yes');
      expect(resultBoolean).toBe('common.yes');
    });
  })

  describe('FALSE Scenario', () => {
    it('should return "No" translation key if value is "Falsish"', () => {
      const resultString = pipe.transform('false');
      const resultBoolean = pipe.transform(false);
      expect(resultString).toBe('common.no');
      expect(resultBoolean).toBe('common.no');
    });
  })

  describe('Invalid values Scenario', () => {
    it('should return error if value is not a boolean-like value', () => {
      let error;
      try {
        pipe.transform('test');
        error = false;
      } catch (_) {
        error = true;
      }
      expect(error).toBe(true);
    });
  })
});
