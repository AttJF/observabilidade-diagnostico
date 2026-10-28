import { sum } from './sum';

describe('sum function', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const a = 2;
    const b = 3;
    // Act
    const result = sum(a, b);
    // Assert
    expect(result).toBe(5);
  });
});
