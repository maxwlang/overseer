const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
const bPromise = require('bluebird')

module.exports = async (bot, emojis, selected = 0) => {
    const botName = bot.user.username
    const avatarUrl = bot.user.displayAvatarURL({ dynamic: true })
    const serverName = bot.guilds.cache.get(bot.config.server.id)
    const { User_Reacts, User, Emote } = bot.db.sequelize.models

    bot.statusEmbedIndex = selected
    const emoji = emojis[selected]

    const users = await User.findAll()
    const leaderboard = (await bPromise.map(users, async user => {
        // Try and find emoji reference
        const server = bot.guilds.cache.get(bot.config.server.id)
        const customEmoji = server.emojis.cache.find(cacheEmoji => cacheEmoji.name === emoji)
        const isCustom = customEmoji !== undefined

        const [emojiDetails] = await Emote.findAll({
            where: (() => {
                const query = { isCustom }
                if (isCustom) query.customId = customEmoji.id
                if (!isCustom) query.unicodeValue = emoji
                return query
            })()
        })

        // console.log(customEmoji)

        const [userTotals] = await User_Reacts.count({
            group: 'userUuid',
            where: {
                userUuid: user.dataValues.uuid,
                emoteUuid: emojiDetails.dataValues.uuid
                // also include emote details here
            },
        })
        return {
            total: userTotals !== undefined ? userTotals.count : 0,
            snowflake: user.dataValues.snowflake,
        }
    })).sort((a, b) => b.total - a.total)

    // inside a command, event listener, etc.
    const embed = new MessageEmbed()
        .setColor('#ffab34')
        .setTitle(`${serverName}'s ${emoji} Leaderboard`)
        .setAuthor({
            name: botName,
            iconURL: avatarUrl,
            url: 'https://github.com/maxwlang/accomplice'
        })
        .setDescription(`Automatically updating Leaderboard of top  ${emoji}  earners on ${serverName}.`)
        .setThumbnail(
            emoji === '⭐'
                ? 'https://www.pngitem.com/pimgs/m/8-86120_star-clipart-smiley-funny-star-clipart-hd-png.png'
                : 'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png',
        )
        .addFields(
            { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({
            text: 'Max says hi',
            iconURL: 'https://avatars.githubusercontent.com/u/59022944?v=4',
        })

    let failed = false
    for (let i = 0; i < bot.config.leaderboard.maxUsers; i++) {
        try {
            await bot.users.fetch(leaderboard[i].snowflake)
                // eslint-disable-next-line no-loop-func
                .then(user => {
                    const server = bot.guilds.cache.get(bot.config.server.id)
                    const customEmoji = server.emojis.cache.find(cacheEmoji => cacheEmoji.name === emoji)
                    const isCustom = customEmoji !== undefined
                    const visualEmoji = !isCustom ? emoji : customEmoji.toString()

                    if (leaderboard[i].total === 0) return

                    embed.addFields(
                        {
                            name: `${i + 1}. ${user.username}`,
                            value: `${visualEmoji} - ${leaderboard[i].total}`,
                            inline: true,
                        },
                    )
                })
                .catch(e => {
                    if (e.code === 10013 && leaderboard[i].snowflake !== undefined) return
                    throw e
                })
        } catch (e) {
            failed = true
            embed.addFields(
                {
                    name: 'No React Data',
                    value: "We're probably indexing server reacts. Check back in a bit.",
                    inline: true,
                },
            )
            break
        }
    }

    embed.addFields(
        { name: '\u200B', value: '\u200B' },
    )

    if (failed) return { embeds: [embed] }

    const selectOptions = await bPromise.map(emojis, async (emoji, index) => {
        const server = bot.guilds.cache.get(bot.config.server.id)
        const customEmoji = server.emojis.cache.find(cacheEmoji => cacheEmoji.name === emoji)
        const isCustom = customEmoji !== undefined

        const [emojiDetails] = await Emote.findAll({
            where: (() => {
                const query = { isCustom }
                if (isCustom) query.customId = customEmoji.id
                if (!isCustom) query.unicodeValue = emoji
                return query
            })()
        })

        const visualEmoji = isCustom ? emoji : emojiDetails.dataValues.unicodeValue

        return {
            label: `${visualEmoji} Leaderboard`,
            description: `User leaderboard for the ${visualEmoji} emoji.`,
            value: index.toString(),
            default: selected > 0 ? index === selected : index === 0,
        }
    })

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('updateLeaderboard')
                .setPlaceholder(`${emoji} Leaderboard`)
                .addOptions(selectOptions),
        )

    return { embeds: [embed], components: [row] }
}
