const { MessageEmbed } = require('discord.js')
const ordinal = require('ordinal')

module.exports = async bot => {
    const leaders = [
        {
            name: 'Jeef Beezor',
            points: 100
        },
        {
            name: 'Theef Beezor',
            points: 75
        },
        {
            name: 'Leef Beezor',
            points: 10
        },
        {
            name: 'Steef Beezor',
            points: 4
        }
    ]

    const embed = new MessageEmbed()
        .setColor('#6aaa64')
        .setTitle('Wordle Leaderboard')
        .setDescription('This is the up to date leaderboard of server challenge participants.')
        .setImage('https://i.imgur.com/C0kpqdl.png')
        .setThumbnail('https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
        )
        .addFields(
            leaders.map((leader, index) => (
                {
                    name: `${ordinal(index + 1)}.\n${leader.name}`,
                    value: `${leader.points} points`,
                    inline: true
                }
            ))
        )
        .setTimestamp()

    return { embeds: [embed] }
}
