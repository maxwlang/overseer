const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = async bot => {
    const wardle = btoa(bot.activeWord.word) // TODO: replace with non-deprecated
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
                .setStyle('LINK')
                .setURL(`https://www.wordleunlimited.com/?wardle=${wardle}`)
                .setLabel('Open Challenge'),
            new MessageButton()
                .setCustomId('solveChallenge')
                .setLabel('Solve Challenge')
                .setStyle('SUCCESS')
        )

    return { embeds: [embed], components: [row] }
}
