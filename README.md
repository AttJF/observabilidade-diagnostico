# Registro dos exercícios

## Exercício 4

- Sintoma: Loggers não esta funcionando corretamente. Não aparece o de inicio e fim de processo. O log do error aparece com coisa faltando
- Passos para reproduzir: Iniciar aplicação. Rodar a rota pedidos tanto com erro e sem erro . 
- Resultado esperado: Mostrar console log no terminal de iniciado, terminado, tal qual as rotas 
- Resultado obtido (linha de log copiada): 

{"error":{},"level":"error","message":"erro na requisição"}
^C

- Hipótese: Problema com o logger
- Ferramenta utilizada: Postman
- Causa encontrada: Logger esta apenas tratando erros devido a linha level: 'error', esta mandando tambem informações sigilosas e não retorna o erro corretamente pois falta alguns try catch e colocar corretamente o formatod do error no logger 
- Correção aplicada: Alterado o nivel para info. Colocado um try catch na função processOrder alem de mandar apenas o idorder para o logger. Reconfigurado o winston. Alem disso foi arrumado o formato do error do logger. 
- Como a correção foi validada (linhas reais):

 {"level":"info","message":"servidor iniciado","port":3000,"timestamp":"2026-09-21T20:26:50.683Z"}

{"level":"info","message":"inicio do processamento","orderId":"2","timestamp":"2026-09-21T20:26:54.525Z"}

{"level":"info","message":"fim do processamento","orderId":"2","timestamp":"2026-09-21T20:26:54.526Z"}

{"level":"info","message":"inicio do processamento","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.714Z"}

{"error":{"message":"Pedido inexistente não encontrado","stack":"Error: Pedido inexistente não encontrado\n    at findOrder (/home/jf/projects/observabilidade-diagnostico/src/orders.ts:15:21)\n    at processOrder (/home/jf/projects/observabilidade-diagnostico/src/orders.ts:24:25)\n    at <anonymous> (/home/jf/projects/observabilidade-diagnostico/src/server.ts:18:23)\n    at Layer.handleRequest (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/layer.js:152:17)\n    at next (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/route.js:157:13)\n    at Route.dispatch (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/route.js:117:3)\n    at handle (/home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:435:11)\n    at Layer.handleRequest (/home/jf/projects/observabilidade-diagnostico/node_modules/router/lib/layer.js:152:17)\n    at /home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:295:15\n    at param (/home/jf/projects/observabilidade-diagnostico/node_modules/router/index.js:600:14)"},"level":"error","message":"erro ao processar pedido","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.716Z"}

{"level":"info","message":"fim do processamento","orderId":"inexistente","timestamp":"2026-09-21T20:26:56.716Z"}

{"error":{},"level":"error","message":"erro na requisição","timestamp":"2026-09-21T20:26:56.717Z"}

## Exercício 5

- Sintoma: As requisições não apareciam no log. O middleware estava depois das rotas. Além disso, ele tentava registrar o status e o tempo antes da resposta terminar.
- Passos para reproduzir: Iniciar a aplicação e chamar /health, /rota-inexistente, /usuarios/42, /erro e /lento.
- Resultado esperado: Aparecer uma linha request para cada chamada.
- Resultado obtido antes da correção (linha de log copiada): O middleware nem chegava a executar.
- Hipótese: O app.use(requestLogger); estava na posição errada e fazia o log cedo demais.
- Ferramenta utilizada: Leitura do código, terminal e requisições HTTP.
- Causa encontrada: app.use(requestLogger) estava depois das rotas. Dentro do middleware, o log era feito antes de next(), quando a resposta ainda não tinha terminado.
- Correção aplicada: O middleware foi movido para antes das rotas. Agora ele começa a medir o tempo na chegada da requisição e faz o log no evento finish, usando o status final da resposta.
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
- Hipótese:Uma tarefa agendada pela rota estava lançando um erro depois que a resposta HTTP já tinha sido enviada.
- Causa encontrada:O throw acontece dentro do callback do setTimeout. A função da rota já terminou quando esse callback executa, então o middleware de erro do Express não recebe a exceção. Ela derruba o processo Node.js, que é iniciado novamente pelo PM2.
- Correção aplicada:
- Dois testes após a correção e contador de restarts:
