// @ts-check

module.exports = {
  apps: [
    {
      name: "zenithra",
      script: "dist/sharding.js",
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_file: ".env"
    }
  ]
};
