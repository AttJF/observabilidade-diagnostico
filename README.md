# Testes automatizados com Jest

Entrega das atividades de testes automatizados com Node.js, TypeScript e Jest.

O projeto do exercício está em [exercicios/atividade-jest](exercicios/atividade-jest). Ele contém funções de soma, subtração e montagem de operações, testes no padrão Arrange, Act e Assert e exemplos dos matchers `toBe`, `toEqual`, `toContain`, `toBeTruthy` e `toBeNull`.

## Executar

Requer Node.js 18 ou superior e npm. A partir da raiz do repositório:

```bash
cd exercicios/atividade-jest
npm ci
npm test
npm run typecheck
```

Execute esses comandos na pasta indicada, pois a raiz do repositório possui uma configuração separada para os exercícios anteriores de observabilidade.

## Respostas

As respostas das atividades estão em [entrega/perguntas.md](exercicios/atividade-jest/entrega/perguntas.md).

A suíte de Jest contém 12 testes em 3 arquivos de teste. O exemplo de `toBeNull` é separado, pois a função de montagem de operações não retorna valores nulos.
