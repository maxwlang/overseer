
(async () => {
    const config = require('./config/bot.json')
    const logger = require('./modules/logger')
    const db = require('./sequelize/models')

    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        const {User_Reacts, User, Emote} = db.sequelize.models
        logger.info(`Loaded ${await Emote.count()} emotes, ${await User_Reacts.count()} reacts, and ${await User.count()} users.`)

        logger.info('Loading bot')
        await require('./bot')(config, db, logger)
    } catch (e) {
        logger.error(e.toString())
    }
})()
