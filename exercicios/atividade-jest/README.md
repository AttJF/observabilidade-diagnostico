# Laboratório — Testes automatizados com Jest

Base preparada para você realizar as atividades do ENUNCIADO.txt. A atividade 2 está configurada com o exemplo de soma; as respostas e a atividade 3 ficam para você completar.

## Começar

Requer Node.js 18 ou superior e npm. Na raiz do repositório:

```bash
cd exercicios/atividade-jest
npm ci
npm test
npm run typecheck
```

Este laboratório tem package.json, lockfile e configuração próprios. O comando npm test na raiz continua executando os testes de observabilidade; execute os comandos acima nesta pasta.

## Roteiro

1. Leia ENUNCIADO.txt e preencha entrega/atividade-1.md.
2. Revise package.json, tsconfig.json, jest.config.js, src/sum.ts e src/sum.spec.ts. Responda entrega/atividade-2.md.
3. Implemente src/subtract.ts. Complete src/subtract.spec.ts, substituindo it.skip e it.todo por testes reais com AAA.
4. Crie montarOperacao e seus testes conforme o enunciado. Use entrega/atividade-3.md como checklist.
5. Faça o desafio de frete se desejar.
6. Salve a saída real da suíte para entrega:

```bash
npm test -- --runInBand --no-color > entrega/atividade-3-saida.txt 2>&1
```

Na base inicial, somente a soma é executada; os cinco casos de subtração aparecem como pendentes. Uma suíte verde com skip/todo ainda não significa que a atividade 3 está concluída. A evidência da atividade 2 foi capturada executando apenas sum.spec.ts.

## Entrega

Preencha os arquivos em entrega/, remova todos os skip/todo ao concluir e confira npm test e npm run typecheck. Versione os fontes e package-lock.json; node_modules não deve ser entregue. O .gitignore do repositório já exclui essa pasta.
