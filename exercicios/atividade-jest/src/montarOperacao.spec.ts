import { montarOperacao } from './montarOperacao';

describe('montarOperacao function', () => {
  it('should return an object with the subtraction operation, values and result', () => {
    // Arrange
    const a = 10;
    const b = 4;
    const expected = {
      operacao: 'subtract',
      valores: [10, 4],
      resultado: 6,
    };

    // Act
    const result = montarOperacao(a, b, 'subtract');

    // Assert
    expect(result).toEqual(expected);
  });
  it('should return an object with the sum operation, values and result', () => {
    // Arrange
    const a = 10;
    const b = 4;
    const expected = {
      operacao: 'sum',
      valores: [10, 4],
      resultado: 14,
    };

    // Act
    const result = montarOperacao(a, b, 'sum');

    // Assert
    expect(result).toEqual(expected);
  });
  it('should return the correct sum result', () => {
    // Arrange
    const a = 10;
    const b = 4;

    // Act
    const result = montarOperacao(a, b, 'sum');

    // Assert
    expect(result.resultado).toBe(14);
  });

  it('should include the first input number in the values array', () => {
    // Arrange
    const a = 10;
    const b = 4;

    // Act
    const result = montarOperacao(a, b, 'subtract');

    // Assert
    expect(result.valores).toContain(10);
  });

  it('should return a truthy operation name', () => {
    // Arrange
    const a = 10;
    const b = 4;

    // Act
    const result = montarOperacao(a, b, 'sum');

    // Assert
    // Uma string não vazia é truthy; isso não verifica seu texto exato.
    expect(result.operacao).toBeTruthy();
  });
});

// Exemplo didático separado: montarOperacao não possui retorno ou campo nulo.
describe('toBeNull matcher example', () => {
  it('should identify null when parsing a JSON null value', () => {
    // Arrange
    const json = 'null';

    // Act
    const result = JSON.parse(json);

    // Assert
    expect(result).toBeNull();
  });
});
