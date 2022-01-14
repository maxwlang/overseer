const { MessageEmbed } = require('discord.js')
const bPromise = require('bluebird')

module.exports = (bot, emoji) => {
    const botName = bot.user.username
    const avatarUrl = bot.user.displayAvatarURL({ dynamic: true })
    const serverName = bot.guilds.cache.get(bot.config.server.id)
    
    // inside a command, event listener, etc.
    const embed = new MessageEmbed()
        .setColor('#ffab34')
        .setTitle(`${serverName}'s ${emoji} Leaderboard`)
        // .setURL('https://discord.js.org/')
        .setAuthor({
            name: botName,
            iconURL: avatarUrl,
            // url: 'https://discord.js.org'
        })
        .setDescription(`Automatically updating Leaderboard of top  ${emoji}  earners on ${serverName}.`)
        .setThumbnail(
            emoji === '⭐' ?
                'https://www.pngitem.com/pimgs/m/8-86120_star-clipart-smiley-funny-star-clipart-hd-png.png' :
                'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png'
        )
        .addFields(
            { name: '\u200B', value: '\u200B' }
        )
        // .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({
            text: 'Max says hi',
            iconURL: 'https://avatars.githubusercontent.com/u/59022944?v=4'
        })

        for (let i = 0; i < bot.config.leaderboard.maxUsers; i++) {
            embed.addFields(
                {
                    name: `${i + 1}. Max`,
                    value: `${emoji} - 290`,
                    inline: true
                },
            )
        }

        embed.addFields(
            { name: '\u200B', value: '\u200B' }
        )

    return embed
}