const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = () => {
    const embed = new MessageEmbed()
        .setColor('#6aaa64')
        .setTitle('Server Challenge')
        .setDescription('This is the current server Wordle challenge. You earn points based on how you complete the challenge!')
        .setImage('https://i.imgur.com/B2AHqpO.png')
        .setThumbnail('https://i.imgur.com/ENzx65A.gif')
        .setTimestamp()

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('openChallenge')
                .setLabel('Open Challenge')
                .setStyle('PRIMARY')
        )

    return { embeds: [embed], components: [row] }
}
