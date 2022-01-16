
(async () => {
    const config = require('./config/bot.json')
    const logger = require('./modules/logger')
    const db = require('./sequelize/models')

    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        logger.info(`Loaded ${await db.sequelize.models.User_Reacts.count()} reacts for ${await db.sequelize.models.User.count()} users.`)
        
        logger.info('Loading bot')
        await require('./bot')(config, db, logger)
    } catch (e) {
        logger.error(e.toString())
    }
})()
