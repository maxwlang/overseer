const { DateTime } = require('luxon')
const { getNewWord, findActiveWord, setActiveWord } = require('../util')
const generateLeaderboardEmbed = require('../embeds/leaderboard')
const generateChallengeEmbed = require('../embeds/challenge')

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot) {
        if (bot.activeWord !== null) return
        await initializeActiveWord(bot)
        await createEmbed(bot)
        await createThread(bot)
    },
}

async function initializeActiveWord(bot) {
    bot.log.info('Beginning active word discovery')

    bot.log.info('Checking for existing active word in DB')
    const activeWord = await findActiveWord(bot)

    if (activeWord !== undefined && activeWord.dataValues !== undefined) {
        // We have an active word, set it back onto the instance and return out.
        bot.log.info(`Setting current active word "${activeWord.dataValues.word}"`)
        bot.activeWord = activeWord.dataValues
        return
    }

    bot.log.info('Getting new active word')
    const word = await getNewWord(bot)
    const isSet = await setActiveWord(word.dataValues.uuid, bot)

    if (!isSet) {
        bot.log.error('Failed to set active word')
        throw new Error('Failed to set active word')
    }

    bot.activeWord = word.dataValues
    bot.log.info(`Set active word "${word.dataValues.word}"`)
}

async function createEmbed(bot) {
    bot.log.info('Creating embeds')
    const { Session } = bot.db.sequelize.models
    const session = await Session.findAll({
        where: {
            uuid: bot.sessionUuid
        }
    })

    if (session.length === 0) {
        throw new Error('No session exists!')
    }

    // Create or assign leaderboard embed to bot
    if (session[0].dataValues.leaderboardMessageSnowflake === null) {
        createLeaderboardEmbed(bot)
    } else {
        const leaderboardChannel = bot.channels.cache.get(bot.config.server.channel.leaderboard)
        const message = await leaderboardChannel.messages.fetch(session[0].dataValues.leaderboardMessageSnowflake)
            .catch(() => undefined)

        if (message === undefined) {
            await createLeaderboardEmbed(bot)
        } else {
            bot.leaderboardEmbed = message
        }
    }

    // Create or assign challenge embed to bot
    if (session[0].dataValues.challengeMessageSnowflake === null) {
        await createChallengeEmbed(bot)
    } else {
        const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)
        const message = await challengeChannel.messages.fetch(session[0].dataValues.challengeMessageSnowflake)
            .catch(() => undefined)
        if (message === undefined) {
            await createChallengeEmbed(bot)
        } else {
            bot.challengeEmbed = message
        }
    }
}

async function createLeaderboardEmbed(bot) {
    bot.log.info('Creating discord leaderboard embed')
    const leaderboardChannel = bot.channels.cache.get(bot.config.server.channel.leaderboard)

    try {
        await leaderboardChannel.messages.fetch({ limit: 100 })
            .then((messages) => messages.forEach(async message => {
                if (message.author.id === bot.user.id) {
                    await message.delete()
                }
            }))
            .catch(() => {
                throw new Error('Could not delete leaderboard channel message')
            })
    } catch (e) {
        throw new Error('Could not delete previous messages')
    }

    const leaderboardEmbed = await generateLeaderboardEmbed(bot)
    bot.leaderboardEmbed = await leaderboardChannel.send(leaderboardEmbed)

    const { Session } = bot.db.sequelize.models
    await Session.update({
        leaderboardMessageSnowflake: bot.leaderboardEmbed.id
    }, {
        where: {
            uuid: bot.sessionUuid
        }
    })
}

async function createChallengeEmbed(bot) {
    bot.log.info('Creating discord challenge embed')
    const leaderboardChannel = bot.channels.cache.get(bot.config.server.channel.leaderboard)
    const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)

    // TODO: Also delete thread from in session table if deleting message and re-creating
    try {
        if (leaderboardChannel.id !== challengeChannel.id) {
            await challengeChannel.messages.fetch({ limit: 100 })
                .then((messages) => messages.forEach(async message => {
                    if (message.author.id === bot.user.id) {
                        await message.delete()
                    }
                }))
                .catch(() => {
                    throw new Error('Could not delete challenge channel message')
                })
        }
    } catch (e) {
        throw new Error('Could not delete previous messages')
    }

    const challengeEmbed = await generateChallengeEmbed(bot)
    bot.challengeEmbed = await challengeChannel.send(challengeEmbed)

    const { Session } = bot.db.sequelize.models
    await Session.update({
        challengeMessageSnowflake: bot.challengeEmbed.id
    }, {
        where: {
            uuid: bot.sessionUuid
        }
    })
}

async function createThread(bot) {
    bot.log.info('Creating challenge thread')
    const { Session } = bot.db.sequelize.models

    const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)

    const session = await Session.findAll({
        where: {
            uuid: bot.sessionUuid
        }
    })

    if (session.length === 0 || session[0].dataValues.challengeMessageSnowflake === null) {
        throw new Error('Can not create thread, can not locate challenge message')
    }

    const thread = await challengeChannel.threads.fetch(session[0].dataValues.threadUuid)

    if (thread !== undefined) {
        // TODO: Are there additional edge cases here?
        if (!thread.archived) {
            bot.log.info('Thread already exists')
            return
        }
    }

    bot.log.info('Creating thread')
    await generateThread(bot)
}

async function generateThread(bot) {
    const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)
    const dateString = DateTime.now().toFormat('MM-dd-yyyy')

    const thread = await challengeChannel.threads.create({
        name: '⭐-post-daily-results-here',
        autoArchiveDuration: 1440, // 24 hrs
        reason: `Created daily thread for ${dateString}`,
    })

    const { Session } = bot.db.sequelize.models
    await Session.update({ threadUuid: thread.id }, {
        where: {
            uuid: bot.sessionUuid
        }
    })
}

// TODO:
/**
 * - Need to handle word changing (delete challenge embed, recreate)
 * - Need to handle thread closing in association with above, edit name of thread
 * - Need to create & implement wordle clone.
 */
