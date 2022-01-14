const createStatusEmbed = require('../embeds/statusEmbed')

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, bot) {
		switch (`${interaction.componentType}:${interaction.customId}`) {

			case 'SELECT_MENU:updateLeaderboard':
				const statusEmbed = await createStatusEmbed(bot, bot.config.emoji.watching, interaction.values[0])
				bot.statusEmbed.edit(statusEmbed)
				interaction.deferUpdate()
				break

			default:
				interaction.reply({ content: 'Unable to handle this interaction.', ephemeral: true })
		}
	},
}