const { locateOrCreateEmoteDefinition, locateOrCreateReactorDefinition, locateOrCreateReacteeDefinition } = require('../util')

module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute(reaction, user, bot) {
        // When a reaction is received, check if the structure is partial (old messages not cached)
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch()
            } catch (error) {
                bot.log.error('Something went wrong when fetching the message: ', error)
                // Return as `reaction.message.author` may be undefined/null
                return
            }
        }

        // Look for existing emote definition
        const emojiUUID = await locateOrCreateEmoteDefinition(reaction, bot)

        // Find or create reactor user
        const reactorUUID = await locateOrCreateReactorDefinition(user, bot)

        // Find or create reactee user
        const reacteeUUID = await locateOrCreateReacteeDefinition(reaction.message, bot)

        console.log(emojiUUID, reactorUUID, reacteeUUID)

        // Now the message has been cached and is fully available
        // console.log(user)
        // console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`)
        // // The reaction is now also fully available and the properties will be reflected accurately:
        // console.log(`${reaction.count} user(s) have given the same reaction to this message!`)
    },
}
