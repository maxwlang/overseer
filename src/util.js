const { sample } = require('underscore')
const uuidv4 = require('uuid').v4
const { DateTime } = require('luxon')

async function findActiveWord(bot) {
    const { Word, Session } = bot.db.sequelize.models

    const session = await Session.findAll({
        where: {
            uuid: bot.sessionUuid
        }
    })

    if (session.length === 0 || session[0].dataValues.wordUuid === null) return []

    const expired = DateTime.fromJSDate(session[0].dataValues.wordExpireDateTime).diffNow().toMillis() < 0
    if (expired) return []

    const [activeWord] = await Word.findAll({
        limit: 1,
        where: {
            uuid: session[0].dataValues.wordUuid
        },
    })

    return activeWord || []
}

async function setActiveWord(wordUuid, bot) {
    const { Word, Session } = bot.db.sequelize.models

    // Set all word to burnt
    await Word.update({ burnt: true }, {
        where: {
            uuid: wordUuid
        }
    })

    // Set word active in session
    const expireTime = DateTime
        .now()
        .setZone('America/Chicago')
        .plus({ days: 1 })
        .startOf('day')
        .toJSDate()

    await Session.update({
        wordUuid,
        wordExpireDateTime: expireTime
    }, {
        where: {
            uuid: bot.sessionUuid
        }
    })

    // return result.length > 0
    return true
}

async function getNewWord(bot) {
    const { Word } = bot.db.sequelize.models

    // Select one random unburnt word!
    const result = await Word.findAll({
        where: {
            burnt: false
        }
    })

    if (result.length === 0) {
        bot.log.error('Out of words')
        // throw new Error('Out of words')
    }

    const [word] = sample(result, 1)
    return word
}

async function locateOrCreateUser(user, bot) {
    const { User } = bot.db.sequelize.models
    const userDefinition = await User.findAll({
        where: {
            snowflake: user.id
        }
    })

    let userUUID
    if (userDefinition.length > 0) {
        userUUID = userDefinition[0].dataValues.uuid
    } else {
        // Create a new definition
        userUUID = uuidv4()
        await User.create({
            uuid: userUUID,
            snowflake: user.id
        })
    }
    return userUUID
}

module.exports = {
    findActiveWord,
    setActiveWord,
    getNewWord,
    locateOrCreateUser
}
