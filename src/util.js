// const uuidv4 = require('uuid').v4
const { sample } = require('underscore')

async function findActiveWord(bot) {
    const { Word, Session } = bot.db.sequelize.models

    const session = await Session.findAll({
        where: {
            uuid: bot.sessionUuid
        }
    })

    if (session.length === 0 || session[0].dataValues.wordUuid === null) {
        return []
    }

    const [activeWord] = await Word.findAll({
        limit: 1,
        where: {
            uuid: session[0].dataValues.wordUuid,
            active: true,
            burnt: false,
        },
    })

    return activeWord || []
}

async function setActiveWord(wordUuid, bot) {
    const { Word, Session } = bot.db.sequelize.models

    // Set all active words to inactive
    await Word.update({ active: false }, {
        where: {
            active: true
        }
    })

    // Set new word to active
    const result = await Word.update({ active: true }, {
        where: {
            uuid: wordUuid
        }
    })

    // Set word active in session
    await Session.update({ wordUuid }, {
        where: {
            uuid: bot.sessionUuid
        }
    })

    return result.length > 0
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
        throw new Error('Out of words')
    }

    const [word] = sample(result, 1)
    return word
}

// async function locateOrCreateEmoteDefinition(reaction, bot) {
//     const { Emote } = bot.db.sequelize.models
//     const isCustom = reaction.emoji.id !== null
//     const emoteDefinition = await Emote.findAll({
//         where: (() => {
//             const query = { isCustom }
//             if (isCustom) query.customId = reaction.emoji.id
//             if (!isCustom) query.unicodeValue = reaction.emoji.name
//             return query
//         })(),
//     })

//     let emojiUUID
//     if (emoteDefinition.length > 0) {
//         emojiUUID = emoteDefinition[0].dataValues.uuid
//     } else {
//         // Create a new definition
//         emojiUUID = uuidv4()
//         await Emote.create((() => {
//             const query = {
//                 uuid: emojiUUID,
//                 isCustom,
//             }
//             if (isCustom) query.customId = reaction.emoji.id
//             if (!isCustom) query.unicodeValue = reaction.emoji.name
//             return query
//         })())
//     }
//     return emojiUUID
// }

// async function locateOrCreateReactorDefinition(user, bot) {
//     const { User } = bot.db.sequelize.models
//     const reactorDefinition = await User.findAll({
//         where: {
//             snowflake: user.id,
//         },
//     })

//     let reactorUUID
//     if (reactorDefinition.length > 0) {
//         reactorUUID = reactorDefinition[0].dataValues.uuid
//     } else {
//         // Create a new definition
//         reactorUUID = uuidv4()
//         await User.create({
//             uuid: reactorUUID,
//             snowflake: user.id,
//         })
//     }
//     return reactorUUID
// }

// async function locateOrCreateReacteeDefinition(message, bot) {
//     const { User } = bot.db.sequelize.models
//     const reacteeDefinition = await User.findAll({
//         where: {
//             snowflake: message.author.id,
//         },
//     })

//     let reacteeUUID
//     if (reacteeDefinition.length > 0) {
//         reacteeUUID = reacteeDefinition[0].dataValues.uuid
//     } else {
//         // Create a new definition
//         reacteeUUID = uuidv4()
//         await User.create({
//             uuid: reacteeUUID,
//             snowflake: message.author.id,
//         })
//     }

//     return reacteeUUID
// }

module.exports = {
    findActiveWord,
    setActiveWord,
    getNewWord
}
