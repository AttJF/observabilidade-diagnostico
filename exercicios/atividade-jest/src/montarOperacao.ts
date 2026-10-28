import { sum } from './sum';
import { subtract } from './subtract';
export function montarOperacao(a: number, b: number, operacao: 'sum' | 'subtract'){
    let resultado: number = 0;
    if (operacao === 'sum') {
        resultado = sum(a, b);
    } else if (operacao === 'subtract') {
        resultado = subtract(a, b);
    }
    return { operacao: operacao, valores: [a, b], resultado: resultado };
}
