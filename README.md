# Zenithra

A Discord bot built for the [Drednot.io](https://drednot.io) community. It integrates with the Drednot anonymous API to provide in-game ship tracking and other utilities directly inside Discord.

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
   To convert `.env.example` to `.env`, make sure to fill out all the UPPERCASE variables, otherwise it will not start properly

   ```bash
   npm run env:copy
   ```

## Build

**Production build:**

```bash
npm run build:clean
```

This cleans the `dist/` folder, compiles TypeScript, and copies the database.

**Start after building:**

```bash
npm run start
```

`npm run start` now follows the sharded runtime path. Use `npm run start:bot` if you explicitly want the single-process bot entry instead.

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
