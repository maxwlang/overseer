const bPromise = require('bluebird')
const _ = require('underscore')

module.exports = {
	name: 'ready',
	once: true,
	async execute(bot) {
        bot.log.info('[Sync] Syncing react history..')
		const server = bot.guilds.cache.get(bot.config.server.id)
		let channels = server.channels.cache

		if (bot.config.server.channel.monitorChannelIDs !== null) {
			channels = await bPromise.filter(channels, channel =>
				bot.config.server.channel.monitorChannelIDs.indexOf(channel[1].id) !== -1
			)
		}

		const textChannels = await bPromise.filter(channels, channel => channel[1].type === 'GUILD_TEXT')
		const messages = _.flatten(await bPromise.map(textChannels, async channelArr => {
			const channel = channelArr[1]
			
			if (!(await needsAdditionalMessages(bot, channel))) return []
			return await getAdditionalMessages(bot, channel, bot.config.leaderboard.history)
		}).filter(messageArr => messageArr.length > 0))		
		bot.log.info(`[Sync] ${messages.length} messages downloaded`)

		bot.log.info('[Sync] Tallying reacts')
		await bPromise.each(messages, async message =>
			await tallyReactsForMessage(message)
		)

		// refresh embed
		// if(bot.statusEmbed) bot.statusEmbed = generateStatus

		console.log(messages.length)
	},
}

/**
 * Checks if we need to request additional message history from discord by comparing the latest message snowflake against what we have stored.
 * @param {Client} bot - Bot instance
 * @param {Channel} channel - Discord channel
 * @returns {Boolean} - If latest message id doesn't match stored messageid, return true to refresh
 */
async function needsAdditionalMessages(bot, channel) {
	const {Message_Sync} = bot.db.sequelize.models
	const latestMessageMap = await channel.messages.fetch({ limit: 1 })
	const latestMessage = latestMessageMap.last()
	const latestMessageId = latestMessage.id

	const readResult = await Message_Sync.findAll({
		where: {
			channelSnowflake: channel.id,
			lastMessageSnowflake: latestMessageId
		}
	});

	// Doesn't need to update, we got results for latest message ID
	if (readResult.length > 0) return false

	await Message_Sync.create({
		channelSnowflake: channel.id,
		lastMessageSnowflake: latestMessageId
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

        let fetchedMessages = await channel.messages.fetch(options)
		fetchedMessages = fetchedMessages
        messages.push(...fetchedMessages)
        lastId = fetchedMessages.last().id
		bot.log.info(`[Sync] ${messages.length} (recv) of ${limit} (req) for ${channel.name}`)

        if (fetchedMessages.size !== 100) break
    }

    return messages.map(messageArr => messageArr[1])
}

/**
 * Updates database records based on message reaction status
 * @param {*} message - Discord message
 * @returns {Number} Count of reacts for message
 */
async function tallyReactsForMessage(message) {
	if (!message.reactions || !('cache' in message.reactions) || [...message.reactions.cache].length === 0) {
		// Message doesn't have reacts, check if message is stored with reacts and if so update
		return 0
	} else {
		// Message has reacts, check if message is stored with reacts
			// If not, add message with reacts to database

			// If so, make sure react counts are correct in database
			
		console.log(message.reactions.cache, 'yee')


		// // console.log(Object.keys(latestMessage))
		// // // fetch the users
		// bPromise.each(latestMessage.reactions.cache, reaction => {
		// 	// console.log(Object.keys, reaction, 'aaaas')
		// })
		const reactCount = 2
		return reactCount
	}
}