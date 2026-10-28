# Respostas — Testes automatizados com Jest

## Tipos de testes

### Classificação

| Item | Situação | Tipo | Justificativa |
| --- | --- | --- | --- |
| a | calcularFrete() isolada | Unitário | Verifica uma função isolada, sem acessar banco ou rede. |
| b | Salvar pedido no banco com status inicial | Integração | Verifica se o serviço e o banco trabalham juntos para salvar o pedido com o status correto. |
| c | Fluxo de compra completo | End-to-end | End-to-End faz o processo completo, o que é literalmente Fluxo de Compra Completo. |
| d | Requisição HTTP ao serviço de e-mail após compra | Integração | Não é necessario uma verificação completa do fluxo, porem não é unitario visto que envolve provavelmente varias funções. |
| e | aplicarCupom() | Unitário | Testar uma unica funcção. |
| f | POST /pedidos com resposta 201 e pedido criado | Integração | Não é necessario uma verificação completa do fluxo, porem não é unitario visto que envolve provavelmente varias funções. |

### Pirâmide

| Nível | Tipo | Quantidade relativa | Custo |
| --- | --- | --- | --- |
| Topo | End-to-end | Poucos | Alto |
| Meio | Integração | Quantidade intermediária | Médio |
| Base | Unitário | Muitos | Baixo |

**Por que a base é mais larga que o topo?**

Porque os testes unitários são rápidos, baratos e permitem verificar muitas regras isoladamente. Alem disso, varios testes unitarios conseguem prevenir problemas que seriam encontrados em testes de integração ou End-to-End, alem de serem muito mais faceis e baratos de fazer

### Conceitos

1. **O que são testes automatizados e como diferem dos manuais?**

   São programas que executam ações e comparam o resultado obtido com o esperado. No teste manual, uma pessoa realiza os passos e confere os resultados. O automatizado pode repetir essa verificação sempre que for executado.

2. **O que é regressão e como os testes ajudam a evitá-la?**

   Regressão é quando uma mudança quebra algo que antes funcionava. Os testes ajudam a identificar essa quebra ao executar novamente os casos já verificados, permitindo corrigir o problema antes da entrega.

3. **Explique unitário e integração usando a analogia da orquestra.**

   Unitario seria uma pessoa tocando um instrumento. Integração seriam varias pessoas tocando varios instrumentos juntos para formar uma musica

4. **Cite dois benefícios dos testes no ciclo de vida do software.**

   Encontrar erros mais cedo e dar mais confiança para alterar ou reorganizar o código sem quebrar comportamentos existentes.

5. **Por que qualidade faz parte do processo?**

   Porque precisa ser considerada desde o entendimento dos requisitos até o desenvolvimento, os testes e a manutenção. Verificar a qualidade durante todo o trabalho ajuda a descobrir problemas cedo e reduz o retrabalho.

### Caso do desconto quebrado

Uma equipe alterou o cálculo do total e quebrou o desconto por cupom. O problema foi descoberto por um cliente três dias depois.

1. **Qual tipo de teste encontraria o problema primeiro?**

   Um teste unitário do cálculo do total com cupom, verificando o valor final esperado. Se o problema depender da comunicação entre módulos, um teste de integração também deve cobrir essa interação.

2. **Em que momento executar esse teste?**

   Durante o desenvolvimento, logo após alterar o cálculo, e novamente na integração contínua antes de incorporar a mudança e publicar uma versão.

3. **Além de corrigir, o que fazer com o bug?**

   Adicionar um teste de regressão que reproduza o problema, confirmar que ele falha antes da correção e passa depois, e mantê-lo na suíte para detectar uma possível repetição do erro.

## Configuração do Jest

1. **Qual estrutura foi utilizada e por quê?**

   Os arquivos `.spec.ts` ficam ao lado das funções em `src/`. Essa organização facilita encontrar o teste de cada função e atualizar código e teste juntos.

2. **Qual a função do ts-jest?**

   Transformar o código TypeScript em JavaScript para que o Jest consiga executar os arquivos de teste.

3. **Por que usar testEnvironment node em vez de jsdom?**

   Porque estamos testando funções que rodam no Node.js e não precisam de elementos de uma página. O jsdom simula recursos de navegador, como o DOM, que não são necessários nesses testes.

4. **Qual a diferença entre __tests__ e .spec.ts ao lado do código?**

   A pasta `__tests__` agrupa os testes em um local específico. O arquivo `.spec.ts` ao lado do código mantém o teste próximo da função correspondente. O Jest reconhece as duas convenções; a principal diferença é a organização dos arquivos.

5. **O que acontece se o teste se chamar apenas sum.ts?**

   Fora de uma pasta `__tests__`, o Jest não o identifica automaticamente como teste com a configuração atual, pois o nome não termina em `.spec.ts` ou `.test.ts`. Ele ainda pode ser importado por outros arquivos. Dentro de `__tests__`, o nome `sum.ts` pode ser reconhecido como teste.
