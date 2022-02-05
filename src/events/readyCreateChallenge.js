const { DateTime } = require('luxon')
const uuidv4 = require('uuid').v4
const { getNewWord, findActiveWord, setActiveWord } = require('../util')
const generateLeaderboardEmbed = require('../embeds/leaderboard')
const generateChallengeEmbed = require('../embeds/challenge')

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot) {
        if (bot.activeWord !== null) return
        await initializeActiveWord(bot)
        await verifyEmbed(bot)
        await verifyThread(bot)
    },
    functions: {
        initializeActiveWord,
        verifyEmbed,
        verifyThread
    }
}

async function initializeActiveWord(bot) {
    bot.log.info('Beginning active word discovery')

    bot.log.info('Checking for existing active word in DB')
    const activeWord = await findActiveWord(bot)

    if (activeWord !== undefined && activeWord.dataValues !== undefined) {
        // We have an active word, set it back onto the instance and return out.
        bot.log.info(`Exists -- Setting current active word "${activeWord.dataValues.word}"`)
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

async function verifyEmbed(bot) {
    bot.log.info('Verifying embeds')
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
            bot.log.info('Created leaderboard')
        } else {
            const updatedLeaderboard = await generateLeaderboardEmbed(bot)
            bot.leaderboardEmbed = message
            await bot.leaderboardEmbed.edit(updatedLeaderboard)
            bot.log.info('Leaderboard already exists')
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
            bot.log.info('Created challenge')
        } else {
            bot.challengeEmbed = message
            bot.log.info('Challenge already exists')
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
        challengeMessageSnowflake: bot.challengeEmbed.id,
        threadUuid: null
    }, {
        where: {
            uuid: bot.sessionUuid
        }
    })
}

async function verifyThread(bot) {
    bot.log.info('Verifying challenge thread')
    const { Session, Threads } = bot.db.sequelize.models

    const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)

    const session = await Session.findAll({
        where: {
            uuid: bot.sessionUuid
        }
    })

    if (session.length === 0 || session[0].dataValues.challengeMessageSnowflake === null) {
        throw new Error('Can not create thread, can not locate challenge message')
    }

    const threadRow = await Threads.findAll({
        where: {
            uuid: session[0].dataValues.threadUuid
        }
    })

    let thread
    if (threadRow.length !== 0) {
        // Thread already exists in db, but lets also validate it exists in discord
        thread = await challengeChannel.threads.fetch(
            threadRow[0].dataValues.snowflake
        )
    }

    const expired = DateTime.fromJSDate(session[0].dataValues.wordExpireDateTime).diffNow().toMillis() < 0
    if (thread !== undefined || threadRow.length > 0) {
        if (!thread.archived) {
            if (!expired) {
                // TODO: Are there additional edge cases here?
                bot.log.info('Thread already exists')
                return
            }

            // Expire the thread and fall through to generate
            const name = `${DateTime.now().toFormat('MM-dd-yyyy')}-daily-results`
            await thread.edit({ name })
            await thread.setArchived(true)
            bot.log.info('Archived thread')
        }

        const threadMessage = await challengeChannel.messages.fetch(thread.id)
        await threadMessage.delete()
        bot.log.info('Deleted previous thread creation broadcast')
    }

    bot.log.info('Creating new thread')
    await generateThread(bot)
}

async function generateThread(bot) {
    const challengeChannel = bot.channels.cache.get(bot.config.server.channel.challenge)
    const dateString = DateTime.now().toFormat('MM-dd-yyyy')
    const reason = `Created daily thread for ${dateString}`

    const thread = await challengeChannel.threads.create({
        name: '⭐-post-daily-results-here',
        autoArchiveDuration: 4320,
        reason,
    })

    const { Session, Threads } = bot.db.sequelize.models
    const threadUuid = uuidv4()
    await Threads.create({
        uuid: threadUuid,
        snowflake: thread.id
    })

    await Session.update({ threadUuid }, {
        where: {
            uuid: bot.sessionUuid
        }
    })
    bot.log.info(reason)
}
