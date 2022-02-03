(async () => {
    const config = require('./config/bot.json')
    const logger = require('./modules/logger')
    // const db = require('./sequelize/models')

    try {
        logger.info('Loading database..')
        // await db.sequelize.authenticate()

        // const { User, Word, Leaderboard } = db.sequelize.models
        // logger.info(`Loaded ${await Word.count()} words, ${await Word.count({ where: {word: true}})} solved words, and ${await User.count()} users.`)
        const db = () => {}
        logger.info('Loading bot')
        await require('./bot')(config, db, logger)
    } catch (e) {
        logger.error(e.toString())
    }
})()
