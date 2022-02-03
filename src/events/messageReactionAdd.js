module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        bot.log.info('Overseer online')
    },
}

// const uuidv4 = require('uuid').v4
// const { locateOrCreateEmoteDefinition, locateOrCreateReactorDefinition, locateOrCreateReacteeDefinition } = require('../util')
// const generateStatusEmbed = require('../embeds/statusEmbed')

// module.exports = {
//     name: 'messageReactionAdd',
//     once: false,
//     async execute(reaction, user, bot) {
//         // When a reaction is received, check if the structure is partial (old messages not cached)
//         if (reaction.partial) {
//             // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
//             try {
//                 await reaction.fetch()
//             } catch (error) {
//                 bot.log.error('Something went wrong when fetching the message: ', error)
//                 // Return as `reaction.message.author` may be undefined/null
//                 return
//             }
//         }

//         // If monitoring specific channels and this channel isn't one of them, return out
//         if (bot.config.server.channel.monitorChannelIDs !== null
//             && bot.config.server.channel.monitorChannelIDs.length > 0
//             && bot.config.server.channel.monitorChannelIDs.indexOf(reaction.message.channel.id) === -1
//         ) return

//         // Return out if self-reacts do not count towards the leaderboard
//         if (!bot.config.leaderboard.selfReactsCount && user.id === reaction.message.author.id) return

//         // Return out if bot reactor reacts are disabled and bot react
//         if (bot.config.leaderboard.ignore.fromBots && user.bot) return

//         // Return out if bot reactee reacts are disabled and bot reactee
//         if (bot.config.leaderboard.ignore.toBots && reaction.message.author.bot) return

//         // Return out if reactor in ignore from users
//         if (bot.config.leaderboard.ignore.fromUsers
//             && bot.config.leaderboard.ignore.fromUsers.length > 0
//             && bot.config.leaderboard.ignore.fromUsers.indexOf(user.id) !== -1
//         ) return

//         // Return out if reactee in ignore to users
//         if (bot.config.leaderboard.ignore.toUsers
//             && bot.config.leaderboard.ignore.toUsers.length > 0
//             && bot.config.leaderboard.ignore.toUsers.indexOf(reaction.message.author.id) !== -1
//         ) return

//         // Find or create emote definition in db
//         const emojiUUID = await locateOrCreateEmoteDefinition(reaction, bot)

//         // Find or create reactor user in db
//         const reactorUUID = await locateOrCreateReactorDefinition(user, bot)

//         // Find or create reactee user in db
//         const reacteeUUID = await locateOrCreateReacteeDefinition(reaction.message, bot)

//         try {
//             const { User_Reacts } = bot.db.sequelize.models
//             const existingReactResult = await User_Reacts.findAll({
//                 where: {
//                     messageSnowflake: reaction.message.id,
//                     userUuid: reacteeUUID,
//                     reactorUuid: reactorUUID,
//                     emoteUuid: emojiUUID
//                 }
//             })

//             // We already have this
//             if (existingReactResult.length !== 0) return

//             await User_Reacts.create({
//                 uuid: uuidv4(),
//                 messageSnowflake: reaction.message.id,
//                 userUuid: reacteeUUID,
//                 reactorUuid: reactorUUID,
//                 emoteUuid: emojiUUID
//             })

//             const statusEmbed = await generateStatusEmbed(bot, bot.config.emoji.watching, bot.statusEmbedIndex)
//             if (bot.statusEmbed) bot.statusEmbed.edit(statusEmbed)
//         } catch (e) {
//             bot.log.error(e)
//         }
//     },
// }
