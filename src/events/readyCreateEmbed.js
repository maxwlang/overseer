const createLeaderboardEmbed = require('../embeds/leaderboard')
const createChallengeEmbed = require('../embeds/challenge')

// module.exports = {
//     name: 'ready',
//     once: true,
//     async execute(bot) {
//         bot.log.info('(Re)creating discord embed')

//         // Delete previous messages in this channel. Ideally only the bot posts here.
//         const channel = bot.channels.cache.get(bot.config.server.channel.statsChannelID)
//         channel.messages.fetch({ limit: 100 })
//             .then((messages) => messages.forEach((message) => message.delete()))

//         const statusEmbed = await createStatusEmbed(bot, bot.config.emoji.watching)
//         bot.statusEmbed = await channel.send(statusEmbed)
//     },
// }

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot) {
        bot.log.info('(Re)creating discord embed')

        // Delete previous messages in this channel. Ideally only the bot posts here.
        const leaderboardChannel = bot.channels.cache.get(bot.config.server.channel.leaderboard)
        const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)

        // leaderboardChannel.messages.fetch({ limit: 100 })
        //     .then((messages) => messages.forEach((message) => message.delete()))

        // challengeChannel.messages.fetch({ limit: 100 })
        //     .then((messages) => messages.forEach((message) => message.delete()))

        const leaderboardEmbed = await createLeaderboardEmbed(bot)
        const challengeEmbed = await createChallengeEmbed(bot)

        bot.leaderboardEmbed = await leaderboardChannel.send(leaderboardEmbed)
        bot.challengeEmbed = await challengeChannel.send(challengeEmbed)
    },
}
