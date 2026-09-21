module.exports = {
  apps: [{
    name: 'api',
    script: 'dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    max_restarts: 5,
    env: { NODE_ENV: 'development', PORT: '3000' }
  }]
};
