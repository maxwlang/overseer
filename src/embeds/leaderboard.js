const { MessageEmbed } = require('discord.js')
const ordinal = require('ordinal')
const bPromise = require('bluebird')

module.exports = async bot => {
    const { User_Words, User } = bot.db.sequelize.models
    let leaders = []

    const usersWithWords = await User_Words.findAll({
        group: 'useruuid'
    })

    if (usersWithWords.length > 0) {
        const userTotalPairs = await bPromise.map(usersWithWords, async userRow => {
            const userObj = userRow.dataValues

            const userWordCount = await User_Words.count({
                group: 'useruuid',
                where: {
                    useruuid: userObj.useruuid
                }
            })

            return {
                ...userObj,
                total: userWordCount[0].count ?? 0
            }
        })

        const topX = userTotalPairs
            .sort((a, b) => b.total - a.total)
            .slice(0, bot.config.leaderboard.maxUsers - 1)

        leaders = await bPromise.map(topX, async topUser => {
            const user = await User.findAll({
                where: {
                    uuid: topUser.useruuid
                }
            })

            const { snowflake } = user[0].dataValues
            const discordUser = await bot.users.fetch(snowflake)

            return {
                ...topUser,
                snowflake,
                name: discordUser.username,
                points: topUser.total
            }
        })
    }

    const embed = new MessageEmbed()
        .setColor('#6aaa64')
        .setTitle('Wordle Leaderboard')
        .setDescription('This is the up to date leaderboard of server challenge participants.')
        .setImage('https://i.imgur.com/C0kpqdl.png')
        .setThumbnail('https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()

    if (leaders.length === 0) {
        embed.addFields({ name: "There's nobody here yet!", value: "Complete today's challenge to appear here!", inline: true })
    } else {
        embed.addFields(
            leaders.map((leader, index) => (
                {
                    name: `${ordinal(index + 1)}.\n${leader.name}`,
                    value: `${leader.points} points`,
                    inline: true
                }
            ))
        )
    }

    return { embeds: [embed] }
}
