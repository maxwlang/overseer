const { locateOrCreateUser } = require('../util')

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, bot) {
        switch (`${interaction.componentType}:${interaction.customId}`) {
            case 'BUTTON:openChallenge':
                const userUUID = await locateOrCreateUser(interaction.user, bot)
                interaction.user.send(`Here's your personal challenge link: https://wordle.wtf/challenge/${userUUID}\n\n**Don't share this link! This is specific to you, so you get credit on the leaderboard.**`)
                interaction.deferUpdate()
                break

            default:
                interaction.reply({ content: 'Unable to handle this interaction.', ephemeral: true })
                throw new Error(`Unhandled interaction: ${interaction.componentType}:${interaction.customId}}`)
        }
    },
}
