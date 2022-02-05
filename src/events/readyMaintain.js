const { DateTime } = require('luxon')
const { initializeActiveWord, verifyEmbed, verifyThread } = require('./readyCreateChallenge').functions
const generateLeaderboardEmbed = require('../embeds/leaderboard')

module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        bot.log.info('Setting up maintenance timer')
        bot.maintenanceTimer = setInterval(async () => {
            await maintainLeaderboard(bot)
            await maintainChallenge(bot)
        }, 1000 * bot.config.maintenance.refreshPeriod) // Tick time
    },
}

async function maintainLeaderboard(bot) {
    if (bot.maintaining.leaderboard) return
    if (bot.leaderboardEmbed === null) return

    bot.maintaining.leaderboard = true
    const updatedLeaderboard = await generateLeaderboardEmbed(bot)
    bot.leaderboardEmbed.edit(updatedLeaderboard)
    bot.maintaining.leaderboard = false
}

async function maintainChallenge(bot) {
    if (bot.maintaining.challenge) return

    try {
        bot.maintaining.challenge = true
        bot.log.debug('Checking on challenge')

        const { Session } = bot.db.sequelize.models
        const session = await Session.findAll({
            where: {
                uuid: bot.sessionUuid
            }
        })

        if (session.length === 0 || session[0].dataValues.wordUuid === null) {
            throw new Error('Could not fetch session row')
        }

        const expired = DateTime.fromJSDate(session[0].dataValues.wordExpireDateTime).diffNow().toMillis() < 0
        if (!expired) {
            bot.log.debug('Challenge has not expired')
            return
        }

        await initializeActiveWord(bot)
        await verifyEmbed(bot)
        await verifyThread(bot)
    } finally {
        bot.maintaining.challenge = false
    }
}
