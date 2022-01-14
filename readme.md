# Accomplice
Accompanies starboard bots. Sole purpose is to place an updating embed message in a channel that counts the top reacts in another channel

## Setup
1. Install nodejs 16.
2. Rename `./src/config/bot.json.template` to `./src/config/bot.json`.
3. Configure `config.json`, add token to file.
4. Install packages: `yarn` or `npm i`
5. Create database: `yarn migrate` or `npm migrate`
6. Run: `yarn start` or `npm start` 

Give the bot permissions integer 277025459200

https://discord.com/oauth2/authorize?client_id=931406732800950302&scope=bot&permissions=8