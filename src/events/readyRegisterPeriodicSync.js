const sync = require('./readySyncHistory')

module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        bot.log.info('[Periodic Sync] Registering')

        bot.periodicSync = setInterval(async () => {
            bot.log.info('[Periodic Sync] Running')
            if (bot.syncing) return bot.log.info('[Periodic Sync] Cowardly refusing a sync because we\'re already syncing.')
            bot.syncing = true
            await sync({
                ...bot,
                ...{
                    ...bot.config,
                    leaderboard: {
                        history: 50
                    }
                }
            })
            bot.syncing = false
            bot.log.info('[Periodic Sync] Finished')
        }, 1000 * 60 * 60 * 1 /* 1 hour */)
    },
}
