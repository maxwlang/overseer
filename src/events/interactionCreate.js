module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, bot) {
        const channels = bot.config.server.channel

        bot.log.info(`${interaction.componentType}:${interaction.customId}`)
        switch (`${interaction.componentType}:${interaction.customId}`) {
            case 'BUTTON:solveChallenge':
                console.log(interaction)
                interaction.user.send(`Ready to solve the challenge? Type \`/solve answer\` in <#${channels.answers}>`)
                interaction.deferUpdate()
                break

            // case 'SELECT_MENU:updateLeaderboard':
            //     const statusEmbed = await createStatusEmbed(bot, bot.config.emoji.watching, interaction.values[0])
            //     bot.statusEmbed.edit(statusEmbed)
            //     interaction.deferUpdate()
            //     break

            default:
                interaction.reply({ content: 'Unable to handle this interaction.', ephemeral: true })
        }
    },
}
