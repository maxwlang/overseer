const bPromise = require('bluebird')
const uuidv4 = require('uuid').v4
const _ = require('underscore')
const generateStatusEmbed = require('../embeds/statusEmbed')
const { locateOrCreateEmoteDefinition, locateOrCreateReactorDefinition, locateOrCreateReacteeDefinition } = require('../util')

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot) {
        bot.log.info('[Sync] Syncing react history..')
        const server = bot.guilds.cache.get(bot.config.server.id)
        let channels = server.channels.cache

        if (bot.config.server.channel.monitorChannelIDs !== null) {
            channels = await bPromise.filter(channels, (channel) =>
                bot.config.server.channel.monitorChannelIDs.indexOf(channel[1].id) !== -1)
        }

        const textChannels = await bPromise.filter(channels, (channel) => channel[1].type === 'GUILD_TEXT')
        const messages = _.flatten(await bPromise.map(textChannels, async (channelArr) => {
            const channel = channelArr[1]

            if (!(await needsAdditionalMessages(bot, channel))) return []
            return getAdditionalMessages(bot, channel, bot.config.leaderboard.history)
        }).filter((messageArr) => messageArr.length > 0))

        if (messages.length === 0) return bot.log.info('[Sync] Messages up to date!')
        bot.log.info(`[Sync] ${messages.length} messages downloaded`)

        bot.log.info(`[Sync] Tallying reacts for ${messages.length} messags, this will take some time`)
        await bPromise.each(messages, async (message, index) => {
            if (index % Math.floor((messages.length / 50)) === 0 || index === messages.length) bot.log.info(`[Sync] ${index + 1} of ${messages.length}`)
            await tallyReactsForMessage(bot, message)
        })

        bot.log.info('[Sync] Refreshing embed')
        const statusEmbed = await generateStatusEmbed(bot, bot.config.emoji.watching)
        if (bot.statusEmbed) bot.statusEmbed.edit(statusEmbed)

        bot.log.info('[Sync] Sync complete!')
    },
}

/**
 * Checks if we need to request additional message history from discord by comparing the latest message snowflake against what we have stored.
 * @param {Client} bot - Bot instance
 * @param {Channel} channel - Discord channel
 * @returns {Boolean} - If latest message id doesn't match stored messageid, return true to refresh
 */
async function needsAdditionalMessages(bot, channel) {
    const { Message_Sync } = bot.db.sequelize.models
    const latestMessageMap = await channel.messages.fetch({ limit: 1 })
    const latestMessage = latestMessageMap.last()
    if (latestMessage === undefined) return false
    const latestMessageId = latestMessage.id

    const readResult = await Message_Sync.findAll({
        where: {
            channelSnowflake: channel.id,
            lastMessageSnowflake: latestMessageId,
        },
    })

    // Doesn't need to update, we got results for latest message ID
    if (readResult.length > 0) return false

    await Message_Sync.destroy({
        where: {
            channelSnowflake: channel.id,
        }
    })

    await Message_Sync.create({
        channelSnowflake: channel.id,
        lastMessageSnowflake: latestMessageId,
    })

    return true
}

/**
 * Helper function that allows us to easily grab more than the last 100 discord messages in a channel.
 * @param {Client} bot - Bot instance
 * @param {Channel} channel - Discord channel
 * @param {Number} limit - Integer of how many messages we'd like to request from discord
 * @returns {Array} - A collection of the discord message objects
 */
async function getAdditionalMessages(bot, channel, limit = 500) {
    const messages = []
    let lastId

    while (true) {
        if (messages.length >= limit) break
        const options = { limit: 100 }
        if (lastId) options.before = lastId

        const fetchedMessages = await channel.messages.fetch(options)
        if (fetchedMessages !== undefined) {
            messages.push(...fetchedMessages)
            lastId = fetchedMessages.last().id
            bot.log.info(`[Sync] ${messages.length} (recv) of ${limit} (req) for ${channel.name}`)

            if (fetchedMessages.size !== 100) break
        }
    }

    return messages.map((messageArr) => messageArr[1])
}

/**
 * Updates database records based on message reaction status
 * @param {*} message - Discord message
 */
async function tallyReactsForMessage(bot, message) {
    const { User_Reacts } = bot.db.sequelize.models

    if (!message.reactions || !('cache' in message.reactions) || [...message.reactions.cache].length === 0) {
        // Message doesn't have reacts, check if message is stored with reacts and if so update
        const totalReactions = await User_Reacts.count({
            where: {
                messageSnowflake: message.id,
            },
        })

        if (totalReactions > 0) {
            await User_Reacts.destroy({
                where: {
                    messageSnowflake: message.id,
                },
            })
        }
    } else {
        await bPromise.each(message.reactions.cache, async (reactionArr) => {
            const reaction = reactionArr[1]

            // Look for existing emote definition
            const emojiUUID = await locateOrCreateEmoteDefinition(reaction, bot)

            // Remove previous react data, we'll add updated information next
            await User_Reacts.destroy({
                where: {
                    messageSnowflake: message.id,
                },
            })

            // Link emote uuid to users with user_reacts table
            await bPromise.each(await reaction.users.fetch(), async (userArr) => {
                const user = userArr[1]

                // Return out if self-reacts do not count towards the leaderboard
                if (!bot.config.leaderboard.selfReactsCount && user.id === message.author.id) return

                // Return out if bot reactor reacts are disabled and bot react
                if (bot.config.leaderboard.ignore.fromBots && user.bot) return

                // Return out if bot reactee reacts are disabled and bot reactee
                if (bot.config.leaderboard.ignore.toBots && message.author.bot) return

                // Return out if reactor in ignore from users
                if (bot.config.leaderboard.ignore.fromUsers
                    && bot.config.leaderboard.ignore.fromUsers.length > 0
                    && bot.config.leaderboard.ignore.fromUsers.indexOf(user.id) !== -1
                ) return

                // Return out if reactee in ignore to users
                if (bot.config.leaderboard.ignore.toUsers
                    && bot.config.leaderboard.ignore.toUsers.length > 0
                    && bot.config.leaderboard.ignore.toUsers.indexOf(message.author.id) !== -1
                ) return

                // Find or create reactor user
                const reactorUUID = await locateOrCreateReactorDefinition(user, bot)

                // Find or create reactee user
                const reacteeUUID = await locateOrCreateReacteeDefinition(message, bot)

                // Link
                await User_Reacts.create({
                    uuid: uuidv4(),
                    messageSnowflake: message.id,
                    userUuid: reacteeUUID,
                    reactorUuid: reactorUUID,
                    emoteUuid: emojiUUID,
                })
            })
        })
    }
}
