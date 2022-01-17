const { locateOrCreateEmoteDefinition, locateOrCreateReactorDefinition, locateOrCreateReacteeDefinition } = require('../util')
const generateStatusEmbed = require('../embeds/statusEmbed')

module.exports = {
    name: 'messageReactionRemove',
    once: false,
    async execute(reaction, user, bot) {
        if (bot.syncing) return

        // When a reaction is received, check if the structure is partial (old messages not cached)
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch()
            } catch (error) {
                bot.log.error('Something went wrong when fetching the message: ', error)
                // Return as `reaction.message.author` may be undefined/null
                return
            }
        }

        // Find or create emote definition in db
        const emojiUUID = await locateOrCreateEmoteDefinition(reaction, bot)

        // Find or create reactor user in db
        const reactorUUID = await locateOrCreateReactorDefinition(user, bot)

        // Find or create reactee user in db
        const reacteeUUID = await locateOrCreateReacteeDefinition(reaction.message, bot)

        if (!bot.config.leaderboard.selfReactsCount && reactorUUID === reacteeUUID) return

        try {
            const { User_Reacts } = bot.db.sequelize.models
            const [existingReactResult] = await User_Reacts.findAll({
                where: {
                    messageSnowflake: reaction.message.id,
                    userUuid: reacteeUUID,
                    reactorUuid: reactorUUID,
                    emoteUuid: emojiUUID
                }
            })

            // We don't have this
            if (existingReactResult.length === 0) return

            await User_Reacts.destroy({
                where: {
                    uuid: existingReactResult.dataValues.uuid
                }
            })

            const statusEmbed = await generateStatusEmbed(bot, bot.config.emoji.watching, bot.statusEmbedIndex)
            if (bot.statusEmbed) bot.statusEmbed.edit(statusEmbed)
        } catch (e) {
            bot.log.error(e)
        }
    },
}
