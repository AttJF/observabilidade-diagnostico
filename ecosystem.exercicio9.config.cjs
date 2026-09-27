module.exports = {
  apps: [{
    name: 'exercicio-9',
    script: 'dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: { NODE_ENV: 'development', PORT: '3000' }
  }]
};
