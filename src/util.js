const uuidv4 = require('uuid').v4

async function locateOrCreateEmoteDefinition(reaction, bot) {
    const { Emote } = bot.db.sequelize
    const isCustom = reaction.emoji.id !== null
    const emoteDefinition = await Emote.findAll({
        where: (() => {
            const query = { isCustom }
            if (isCustom) query.customId = reaction.emoji.id
            if (!isCustom) query.unicodeValue = reaction.emoji.name
            return query
        })(),
    })

    let emojiUUID
    if (emoteDefinition.length > 0) {
        emojiUUID = emoteDefinition[0].dataValues.uuid
    } else {
        // Create a new definition
        emojiUUID = uuidv4()
        await Emote.create((() => {
            const query = {
                uuid: emojiUUID,
                isCustom,
            }
            if (isCustom) query.customId = reaction.emoji.id
            if (!isCustom) query.unicodeValue = reaction.emoji.name
            return query
        })())
    }
    return emojiUUID
}

async function locateOrCreateReactorDefinition(user, bot) {
    const { User } = bot.db.sequelize
    const reactorDefinition = await User.findAll({
        where: {
            snowflake: user.id,
        },
    })

    let reactorUUID
    if (reactorDefinition.length > 0) {
        reactorUUID = reactorDefinition[0].dataValues.uuid
    } else {
        // Create a new definition
        reactorUUID = uuidv4()
        await User.create({
            uuid: reactorUUID,
            snowflake: user.id,
        })
    }
    return reactorUUID
}

async function locateOrCreateReacteeDefinition(message, bot) {
    const { User } = bot.db.sequelize
    const reacteeDefinition = await User.findAll({
        where: {
            snowflake: message.author.id,
        },
    })

    let reacteeUUID
    if (reacteeDefinition.length > 0) {
        reacteeUUID = reacteeDefinition[0].dataValues.uuid
    } else {
        // Create a new definition
        reacteeUUID = uuidv4()
        await User.create({
            uuid: reacteeUUID,
            snowflake: message.author.id,
        })
    }
}

module.exports = {
    locateOrCreateEmoteDefinition,
    locateOrCreateReactorDefinition,
    locateOrCreateReacteeDefinition
}
