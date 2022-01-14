const fs = require('fs')
const {Client, Intents} = require('discord.js')

class Bot extends Client {
    constructor(config, db, logger, options) {
        super({
            intents: [Intents.FLAGS.GUILDS],
            ...options
        })
        this.statusEmbed = null
        this.config = config
        this.log = logger
        this.db = db
    }

}

module.exports = async (config, db, logger, options) => {
    const bot = new Bot(config, db, logger, options)
    bot.login(config.token)
    
    const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
        const event = require(`./events/${file}`)
        if (event.once) {
            bot.once(event.name, async (...args) => await event.execute(...args, bot))
        } else {
            bot.on(event.name, async (...args) => await event.execute(...args, bot))
        }
    }
}
