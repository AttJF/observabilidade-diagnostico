const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { Writable } = require('node:stream');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const winston = require('winston');
const { app, errorHandler, applyDiscount, clearMemoryCache, memorySnapshot } = require('../dist/server');
const { logger } = require('../dist/logger');

const logs = [];
logger.clear();
logger.add(new winston.transports.Stream({ stream: new Writable({
  write(chunk, _encoding, callback) {
    logs.push(JSON.parse(chunk.toString()));
    callback();
  }
}) }));

test('7-11', async t => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    clearMemoryCache();
    server.close();
    await once(server, 'close');
  });
  async function request(route, method = 'GET', headers = {}) {
    const response = await fetch(base + route, { method, headers });
    return { status: response.status, id: response.headers.get('x-request-id'), body: await response.json() };
  }
  function checkError(result, status, exercise) {
    assert.equal(result.status, status);
    assert.deepEqual(result.body, { error: 'error', code: status, exercise });
    assert.ok(result.id);
  }

  await t.test('7', async () => {
    const valid = await request('/ex7/valido', 'POST');
    assert.equal(valid.status, 200);
    assert.deepEqual(valid.body, { code: 200, exercise: 7 });
    assert.ok(logs.some(entry => entry.requestId === valid.id && entry.config?.app === 'observabilidade'));
    for (const [scenario, status] of [['ausente',404],['invalido',500],['timer',500],['original',500],['fetch-rede',502],['fetch-404',404],['desconhecido',400]]) {
      checkError(await request(`/ex7/${scenario}`, 'POST'), status, 7);
      assert.equal((await request('/health')).status, 200);
    }
  });
  await t.test('8', async () => {
    const user = await request('/ex8/usuarios/1');
    assert.equal(user.status, 200);
    assert.deepEqual(user.body, { code: 200, exercise: 8 });
    for (const [route, status] of [['usuarios/inexistente',404],['usuarios/falha',500],['erro',500],['erro-async',500],['rota-inexistente',404],['usuarios/toString',404]]) {
      checkError(await request('/ex8/' + route), status, 8);
    }
    checkError(await request('/rota-inexistente'), 404, 0);
    const failure = new Error('error');
    let forwarded;
    errorHandler(failure, {}, { headersSent: true, status() { assert.fail('Response already sent'); } }, error => { forwarded = error; });
    assert.equal(forwarded, failure);
  });
  await t.test('9', async () => {
    const results = await Promise.all(['1','2','inexistente'].map(id => request('/ex9/pedidos/' + id)));
    assert.equal(new Set(results.map(result => result.id)).size, 3);
    for (const result of results) {
      assert.match(result.id, /^[0-9a-f-]{36}$/);
      const group = logs.filter(entry => entry.requestId === result.id);
      assert.equal(group[0].phase, 'start');
      assert.equal(group.at(-1).phase, 'finish');
      assert.ok(group.every(entry => entry.exercise === 9));
      assert.ok(group.some(entry => entry.phase === 'order-start'));
      assert.ok(group.some(entry => entry.phase === 'order-end'));
      if (result.status === 500) assert.ok(group.some(entry => entry.message === 'error'));
    }
    const own = await request('/ex9/pedidos/1', 'GET', { 'X-Request-Id': 'meu-teste-9' });
    assert.equal(own.id, 'meu-teste-9');
    const invalid = await request('/health', 'GET', { 'X-Request-Id': 'id com espaços' });
    assert.match(invalid.id, /^[0-9a-f-]{36}$/);
  });
  await t.test('10', async () => {
    for (const [scenario, expected] of [['original',332.5],['invertida',332.5],['reordenada',332.5],['180',180],['200',200],['500',475],['vazia',0]]) {
      const result = await request('/ex10/' + scenario);
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, { code: 200, exercise: 10 });
      assert.ok(logs.some(entry => entry.requestId === result.id && entry.total === expected));
    }
    const items = [{price:100,qty:1},{price:150,qty:1},{price:50,qty:2}];
    for (const indices of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]) {
      assert.equal(applyDiscount(indices.map(index => items[index])), 332.5);
    }
    checkError(await request('/ex10/toString'),400,10);
  });
  await t.test('11', async () => {
    for (const size of [200,2000,2000]) {
      const result = await request('/ex11/' + size, 'POST');
      assert.equal(result.status,200);
      assert.deepEqual(result.body, { code: 200, exercise: 11 });
      const points = logs.filter(entry => entry.requestId === result.id && entry.unit === 'MiB');
      assert.equal(points.length, size / 200 + 1);
      for (const point of points) {
        assert.ok(point.cacheEntries <= 20);
        assert.ok(point.timers <= 1);
        assert.equal(point.unit,'MiB');
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2200));
    assert.equal(memorySnapshot(0).cacheEntries,0);
    assert.equal(memorySnapshot(0).timers,0);
    checkError(await request('/ex11/5', 'POST'),400,11);
  });
  await t.test('4-6', async () => {
    const order = await request('/pedidos/1');
    assert.deepEqual(order.body, { code: 200, exercise: 4 });
    assert.ok(logs.some(entry => entry.requestId === order.id && entry.total === 30));
    for (const [route, exercise] of [['/erro',5],['/crash',6],['/crash',6]]) {
      checkError(await request(route),500,exercise);
    }
    assert.equal((await request('/health')).status,200);
  });
});

test('No ternary operators', () => {
  function inspect(file) {
    const source = ts.createSourceFile(file, fs.readFileSync(file,'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node) {
      assert.equal(ts.isConditionalExpression(node),false,`Ternary operator in ${file}`);
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
  for (const dir of ['src','tests']) {
    for (const name of fs.readdirSync(path.join(__dirname,'..',dir))) {
      if (/\.(ts|cjs)$/.test(name)) inspect(path.join(__dirname,'..',dir,name));
    }
  }
  for (const name of ['ecosystem.config.cjs','ecosystem.exercicio9.config.cjs']) inspect(path.join(__dirname,'..',name));
});
