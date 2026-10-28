# Registro dos exercícios

## Exercício 4

- Sintoma: Loggers não esta funcionando corretamente. Não aparece o de inicio e fim de processo. O log do error aparece com coisa faltando
- Passos para reproduzir: Chamar /pedidos com e sem erro.
- Resultado esperado: Logs de início, fim e erro.
- Resultado obtido (linha de log copiada): 

{"error":{},"level":"error","message":"erro na requisição"}
^C

- Hipótese: Problema com o logger
- Ferramenta utilizada: Postman
- Causa encontrada: Nível e formato dos logs incorretos.
- Correção aplicada: Nível info, try/catch e log sem dados sensíveis.
- Como a correção foi validada (linhas reais):

 {"level":"info","message":"servidor iniciado","port":3000,"timestamp":"2026-09-21T20:26:50.683Z"}

{"level":"info","message":"inicio do processamento","orderId":"2","timestamp":"2026-09-21T20:26:54.525Z"}

{"level":"info","message":"fim do processamento","orderId":"2","timestamp":"2026-09-21T20:26:54.526Z"}

{"level":"info","message":"inicio do processamento","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.714Z"}

{"error":{"message":"Pedido inexistente não encontrado","stack":"Error: Pedido inexistente não encontrado\n    at findOrder (/home/jf/projects/observabilidade-diagnostico/src/orders.ts:15:21)\n    at processOrder (/home/jf/projects/observabilidade-diagnostico/src/orders.ts:24:25)\n    at <anonymous> (/home/jf/projects/observabilidade-diagnostico/src/server.ts:18:23)\n    at Layer.handleRequest (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/layer.js:152:17)\n    at next (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/route.js:157:13)\n    at Route.dispatch (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/route.js:117:3)\n    at handle (/home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:435:11)\n    at Layer.handleRequest (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/layer.js:152:17)\n    at /home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:295:15\n    at param (/home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:600:14)"},"level":"error","message":"erro ao processar pedido","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.716Z"}

{"level":"info","message":"fim do processamento","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.716Z"}

{"error":{},"level":"error","message":"erro na requisição","timestamp":"2026-09-21T20:26:56.717Z"}

## Exercício 5

- Sintoma: Requisições não apareciam nos logs.
- Passos para reproduzir: Iniciar a aplicação e chamar /health, /rota-inexistente, /usuarios/42, /erro e /lento.
- Resultado esperado: Aparecer uma linha request para cada chamada.
- Resultado obtido antes da correção (linha de log copiada): O middleware nem chegava a executar.
- Hipótese: Middleware na posição errada.
- Ferramenta utilizada: Leitura do código, terminal e requisições HTTP.
- Causa encontrada: Middleware depois das rotas e medição antes do fim da resposta.
- Correção aplicada: Middleware antes das rotas e log no evento finish.
- Como a correção foi validada (linhas reais dos cinco cenários):

GET /health
{"durationMs":4.306802,"level":"info","message":"request","method":"GET","route":"/health","statusCode":200,"timestamp":"2026-09-21T20:42:05.885Z"}
GET /rota-inexistente
{"durationMs":2.0354,"level":"info","message":"request","method":"GET","route":"/rota-inexistente","statusCode":404,"timestamp":"2026-09-21T20:42:05.894Z"}
GET /usuarios/42
{"durationMs":0.865201,"level":"info","message":"request","method":"GET","route":"/usuarios/:id","statusCode":200,"timestamp":"2026-09-21T20:42:05.902Z"}
GET /erro
{"durationMs":1.223601,"level":"info","message":"request","method":"GET","route":"/erro","statusCode":500,"timestamp":"2026-09-21T20:42:05.910Z"}
GET /lento
{"durationMs":201.370981,"level":"info","message":"request","method":"GET","route":"/lento","statusCode":200,"timestamp":"2026-09-21T20:42:06.120Z"}

## Exercício 6

- Sintoma: A rota crash responde 200 mas depois da erro e reinicia o processo com pm2
- pm2 list antes/depois: antes : api online com 4 retry. Depois ela continuou com 5 retries
- Stack trace de pm2 logs api --err --lines 100:Error: falha ao processar a fila
at Timeout._onTimeout (/home/jf/projects/observabilidade-diagnostico/dist/server.js:27:30)
at listOnTimeout (node:internal/timers:605:17)
at process.processTimers (node:internal/timers:541:7)
- Observação em pm2 monit:Apareceu o log da requisição, depois o erro e, em seguida, servidor iniciado. A lista voltou a mostrar a api
- Hipótese: Erro no temporizador após a resposta.
- Causa encontrada: Erro do setTimeout não era tratado.
- Correção aplicada: Aguardar a Promise e encaminhar o erro ao handler.
- Dois testes após a correção: /crash retornou 500 duas vezes. No PM2 temporário, os dois processos continuaram online com 0 restarts.

## Exercício 7

- Sintoma: Erros assíncronos derrubavam o servidor.
- Causa: Promises sem await e erro lançado no temporizador.
- Correção: Usado async/await e tratamento dos erros.
- Teste: Todos os cenários responderam sem derrubar o servidor.
- Exemplo 1: POST /ex7/ausente → 404, erro tratado e servidor funcionando.
- Exemplo 2: POST /ex7/timer → 500, erro tratado e servidor funcionando.

```text
/ex7/valido → 200 {"code":200,"exercise":7}
/ex7/ausente → 404 {"error":"error","code":404,"exercise":7}
/ex7/invalido → 500 {"error":"error","code":500,"exercise":7}
/ex7/timer → 500 {"error":"error","code":500,"exercise":7}
/ex7/original → 500 {"error":"error","code":500,"exercise":7}
/ex7/fetch-rede → 502 {"error":"error","code":502,"exercise":7}
/ex7/fetch-404 → 404 {"error":"error","code":404,"exercise":7}
```

## Exercício 8

- Sintoma: Erros retornavam HTML e detalhes internos.
- Causa: Handler com três parâmetros.
- Correção: Handler global com quatro parâmetros e resposta JSON.
- Teste: Retornos 200, 404 e 500 corretos, sem stack na resposta.
- Exemplo 1: GET /ex8/usuarios/inexistente → 404 em JSON, sem stack.
- Exemplo 2: GET /ex8/erro-async → 500 em JSON, sem stack.

```text
/ex8/usuarios/1 → 200 {"code":200,"exercise":8}
/ex8/usuarios/inexistente → 404 {"error":"error","code":404,"exercise":8}
/ex8/usuarios/falha → 500 {"error":"error","code":500,"exercise":8}
/ex8/erro → 500 {"error":"error","code":500,"exercise":8}
/ex8/erro-async → 500 {"error":"error","code":500,"exercise":8}
/ex8/rota-inexistente → 404 {"error":"error","code":404,"exercise":8}
```

## Exercício 9

- Sintoma: Logs de requisições diferentes se misturavam.
- Causa: Identificador não acompanhava os serviços.
- Correção: UUID, cabeçalho e AsyncLocalStorage.
- Teste: IDs preservados nos logs. No PM2, 30 chamadas geraram 30 IDs distintos em dois processos.
- Exemplo 1: GET /ex9/pedidos/1 com X-Request-Id: test-9 → 200, mesmo id no cabeçalho e nos logs.
- Exemplo 2: GET /ex9/pedidos/inexistente → 500, mesmo id nos logs do serviço, do erro e do fim da resposta.

```text
/ex9/pedidos/1 → 200 requestId=6c9cf91d-ae5f-4302-9b7e-042216dc7230
/ex9/pedidos/2 → 200 requestId=6358878a-7107-4693-b405-f8725ba37941
/ex9/pedidos/inexistente → 500 requestId=33412460-89d3-480a-823f-aca5e79bf440
```

```json
{"exercise":9,"level":"info","message":"200","method":"GET","phase":"start","requestId":"test-9","route":"/ex9/pedidos/1","timestamp":"2026-09-27T02:03:31.810Z"}
{"exercise":9,"level":"info","message":"200","phase":"lookup","requestId":"test-9","timestamp":"2026-09-27T02:03:31.810Z"}
{"exercise":9,"level":"info","message":"200","orderId":"1","phase":"order-start","requestId":"test-9","timestamp":"2026-09-27T02:03:31.910Z"}
{"exercise":9,"level":"info","message":"200","orderId":"1","phase":"order-end","requestId":"test-9","timestamp":"2026-09-27T02:03:31.910Z"}
{"exercise":9,"level":"info","message":"200","phase":"result","requestId":"test-9","timestamp":"2026-09-27T02:03:31.910Z","total":30}
{"durationMs":100.912799,"exercise":9,"level":"info","message":"200","method":"GET","phase":"finish","requestId":"test-9","route":"/ex9/pedidos/:id","statusCode":200,"timestamp":"2026-09-27T02:03:31.911Z"}
```

## Exercício 10

- Sintoma: Desconto aplicado mais de uma vez.
- Causa: Desconto dentro do laço.
- Correção: Aplicar uma vez após somar os itens.
- Teste: Seis ordens diferentes retornaram 332,50. Valores das iterações coletados pelo inspector do Node.
- Exemplo 1: GET /ex10/original → 200; total no log: 332,50.
- Exemplo 2: GET /ex10/reordenada → 200; total no log: 332,50, mesmo mudando a ordem.

```json
{"total":0,"applied":0,"index":0,"item":100,"gross":350}
{"total":100,"applied":0,"index":1,"item":150,"gross":350}
{"total":250,"applied":0,"index":2,"item":100,"gross":350}
```

```text
/ex10/original → 200 total=332.5
/ex10/invertida → 200 total=332.5
/ex10/reordenada → 200 total=332.5
/ex10/180 → 200 total=180
/ex10/200 → 200 total=200
/ex10/500 → 200 total=475
/ex10/vazia → 200 total=0
```

## Exercício 11

- Sintoma: Cache e temporizadores cresciam sem limite.
- Causa: Referências guardadas sem remoção.
- Correção: Limite de 20 entradas, expiração e um temporizador.
- Teste: Lotes de 200, 2000 e 2000. Após expirar, cache e temporizador zeraram.
- Observação: Medições em MiB. Sem comparação antes/depois ou heap snapshots.
- Exemplo 1: POST /ex11/200 → 200; cache limitado a 20 entradas e um temporizador.
- Exemplo 2: POST /ex11/2000 → 200; mesmo limite, inclusive repetindo o lote. Após a espera final, cache e temporizador zeraram.

```text
/ex11/200 {"iteration":200,"rss":115.75,"heapTotal":22.35,"heapUsed":16.29,"external":103.72,"arrayBuffers":100.12,"cacheEntries":20,"timers":1}
/ex11/2000 {"iteration":2000,"rss":223.42,"heapTotal":29.35,"heapUsed":11.04,"external":197.18,"arrayBuffers":193.59,"cacheEntries":20,"timers":1}
/ex11/2000 {"iteration":2000,"rss":212.42,"heapTotal":29.6,"heapUsed":11.02,"external":139.68,"arrayBuffers":136.09,"cacheEntries":20,"timers":1}
Após expiração {"iteration":0,"unit":"MiB","rss":212.42,"heapTotal":29.6,"heapUsed":10.8,"external":94.68,"arrayBuffers":91.09,"cacheEntries":0,"timers":0}
```

## Executar

```bash
npm run dev
npm test
```

Testes: 8 passaram, 0 falharam. Node.js v24.15.0 e Express 5.2.1.


## Módulo de testes automatizados com Jest

Laboratório preparado em [exercicios/atividade-jest](exercicios/atividade-jest/README.md), com configuração isolada, exemplo de soma e modelos para realizar as atividades 1 a 3.
