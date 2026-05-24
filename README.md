# Zenithra

Zenithra is a Discord bot for the Drednot.io community. It uses the Drednot anonymous API for ship tracking and other utilities inside Discord.

## Setup
Clone the repository with `git clone https://github.com/PshsayhiXD/zenithra.git` then move into the folder with `cd zenithra`.
Install dependencies with `npm install`.
Install certs.
Go to `.env.example` and fill in all UPPERCASE variables before starting the bot.
Run `npm run env:copy` to create the `.env` file.

## Build
Run `npm run build:clean` for a production build. This cleans the `dist/` folder, compiles TypeScript, and copies the database.
Start the bot with `npm run start`.
`npm run start` uses the sharded runtime. Use `npm run start:bot` if you want the single-process bot instead.
Start with PM2 using `npm run pm2:start`.

## Docker
Start the bot with Docker using `docker compose up -d --build`.
View logs with `docker compose logs -f`.
Stop containers with `docker compose down`.
Data is stored in the `./data` folder.
