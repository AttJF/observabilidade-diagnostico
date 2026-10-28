import { subtract } from './subtract';

describe('subtract function', () => {
  it('should subtract two positive numbers correctly', () => {
    const a = 10;
    const b = 4;
    const result = subtract(a, b);
    expect(result).toBe(6);
  });
  it('should return a negative result when the second number is greater', () => {
    const a = 4;
    const b = 10;
    const result = subtract(a, b);
    expect(result).toBe(-6);
  });
  it('should preserve the first number when subtracting zero', () => {
    const a = 10;
    const b = 0;
    const result = subtract(a, b);
    expect(result).toBe(10);
  });
  it('should subtract two negative numbers correctly', () => {
    const a = -10;
    const b = -4;
    const result = subtract(a, b);
    expect(result).toBe(-6);
  });
  it('should subtract two decimal numbers correctly', () => {
    const a = 10.5;
    const b = 4.2;
    const result = subtract(a, b);
    expect(result).toBe(6.3);
  });
});
