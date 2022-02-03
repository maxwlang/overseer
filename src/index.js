(async () => {
    const config = require('./config/bot.json')
    const logger = require('./modules/logger')
    const db = require('./sequelize/models')

    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        const { Word } = db.sequelize.models
        logger.info(`Loaded ${await Word.count()} words, ${await Word.count({ where: { burnt: true } })} burnt words`)
        logger.info('Loading bot')
        await require('./bot')(config, db, logger)
    } catch (e) {
        logger.error(e.toString())
    }
})()
