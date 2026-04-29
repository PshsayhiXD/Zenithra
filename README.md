# DredBot Evolve

A Discord bot built for the [Drednot.io](https://drednot.io) community. It integrates with the Drednot anonymous API to provide in-game ship tracking and other utilities directly inside Discord.

## Dependencies

- [Node.js](https://nodejs.org/) v18+
- [discord.js](https://discord.js.org/) v14
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - local database
- [sharp](https://sharp.pixelplumbing.com/) - image processing
- [dotenv](https://github.com/motdotla/dotenv) - environment variable management
- [ws](https://github.com/websockets/ws) - websocket client
- [https-proxy-agent](https://github.com/TooTallNate/node-https-proxy-agent) - proxy agent
- [http-proxy](https://github.com/nodejitsu/node-http-proxy) - proxy server
- [pino](https://github.com/pinojs/pino) - logger
- [pino-pretty](https://github.com/pinojs/pino-pretty) - pretty logger
- [@msgpack/msgpack](https://github.com/msgpack/msgpack-javascript) - msgpack client

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/PshsayhiXD/dredbot-evolve.git
   cd dredbot-evolve
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the required values
   Please note that UPPERCASE variables are require, otherwise it will not start properly

   ```bash
   cp .env.example .env
   ```

## Build

**Production build:**

```bash
npm run build:clean
```

This runs the linter, cleans the `dist/` folder, compiles TypeScript, and copies the database.

**Start after building:**

```bash
npm run start:shard
```

**Using PM2**:

```bash
npm run pm2:start
```

## Docker

You can also run the bot using Docker for easier deployment and consistency.

1. **Build and start the bot:**

   ```bash
   docker compose up -d --build
   ```

2. **Check logs:**

   ```bash
   docker compose logs -f
   ```

3. **Stop the bot:**

   ```bash
   docker compose down
   ```

Data is persisted in the `./data` folder on your host machine.
