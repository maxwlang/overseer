const fs = require('fs')
const { Client, Intents } = require('discord.js')
const bPromise = require('bluebird')

class Bot extends Client {
    constructor(config, db, logger, options) {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
            ...options,
        })
        this.statusEmbed = null
        this.statusEmbedIndex = 0
        this.config = config
        this.log = logger
        this.db = db
    }
}

module.exports = async (config, db, logger, options) => {
    const bot = new Bot(config, db, logger, options)
    bot.login(config.token)

    // Register event handlers
    const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'))
    await bPromise.each(eventFiles, file => {
        // eslint-disable-next-line import/no-dynamic-require
        const event = require(`./events/${file}`)
        if (event.once) return bot.once(event.name, async (...args) => event.execute(...args, bot))
        bot.on(event.name, async (...args) => event.execute(...args, bot))
    })
}
