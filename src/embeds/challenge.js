const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = async bot => {
    const wardle = btoa('carts') // TODO: replace with non-deprecated
    const embed = new MessageEmbed()
        .setColor('#6aaa64')
        .setTitle('Server Challenge')
        .setDescription('This is the current server Wordle challenge. Be the first one to complete it and gain a point on the leaderboard! ')
        .setImage('https://i.imgur.com/B2AHqpO.png')
        .setThumbnail('https://i.imgur.com/ENzx65A.gif')
        .setTimestamp()
        .setFooter({
            text: '12 Solved',
            // iconURL: 'https://avatars.githubusercontent.com/u/59022944?v=4',
        })

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
