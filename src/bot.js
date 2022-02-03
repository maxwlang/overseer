const fs = require('fs')
const { Client, Intents } = require('discord.js')
const bPromise = require('bluebird')
const uuidv4 = require('uuid').v4

class Bot extends Client {
    constructor(config, db, logger, options) {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
            ...options,
        })
        this.leaderboardEmbed = null
        this.challengeEmbed = null
        this.sessionUuid = null
        this.activeWord = null
        this.config = config
        this.log = logger
        this.db = db
    }
}

module.exports = async (config, db, logger, options) => {
    const bot = new Bot(config, db, logger, options)
    bot.login(config.token)

    // Initialize session in db
    await initializeSession(bot)

    // Register event handlers
    const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'))
    await bPromise.each(eventFiles, file => {
        // eslint-disable-next-line import/no-dynamic-require
        const event = require(`./events/${file}`)
        if (event.once) return bot.once(event.name, async (...args) => event.execute(...args, bot))
        bot.on(event.name, async (...args) => event.execute(...args, bot))
    })
}

async function initializeSession(bot) {
    const { Session } = bot.db.sequelize.models

    const session = await Session.findAll()
    if (session.length === 1) {
        bot.sessionUuid = session[0].dataValues.uuid
    } else {
        await Session.destroy({ truncate: true })
        bot.sessionUuid = uuidv4()
        await Session.create({
            uuid: bot.sessionUuid,
            threadUuid: null,
            wordUuid: null
        })
    }
}
