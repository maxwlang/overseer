const createStatusEmbed = require("../embeds/statusEmbed")
const bPromise = require('bluebird')

module.exports = {
	name: 'ready',
	once: true,
	async execute(bot) {
		bot.log.info('(Re)creating discord embed')

		// // Delete previous messages in this channel. Ideally only the bot posts here.
		// const channel = bot.channels.cache.get(bot.config.server.channel.statsChannelID)
		// channel.messages.fetch({limit: 100})
		// 	.then(messages => messages.forEach(message => message.delete()))

		// await bPromise.each(bot.config.emoji.watching, async emoji => {
		// 	const statusEmbed = createStatusEmbed(bot, emoji)
		// 	bot.statusEmbed = await channel.send({ embeds: [statusEmbed] })
		// })
	}
}