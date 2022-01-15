const bPromise = require('bluebird')

module.exports = {
	name: 'ready',
	once: true,
	async execute(bot) {
        bot.log.info('Syncing react history..')
		const server = bot.guilds.cache.get(bot.config.server.id)
		let channels = server.channels.cache

		if (bot.config.server.channel.monitorChannelIDs !== null) {
			channels = await bPromise.filter(channels, channel => {
				console.log(channel.id)
				return bot.config.server.channel.monitorChannelIDs.indexOf(channel.id) !== -1
			})
		}

        console.log(channels.forEach(channel => channel.id))
	},
}