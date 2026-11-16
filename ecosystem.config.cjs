module.exports = {
  apps: [
    {
      name: 'dharmawatch',
      script: './server/index.ts',
      cwd: '/root/dharmawatch',
      interpreter: '/opt/node-v22/bin/node',
      node_args: '--import tsx',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
