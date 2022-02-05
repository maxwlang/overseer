const { createLogger, format, transports } = require('winston')
const config = require('../config/bot.json')

const {
    combine,
    colorize,
    printf,
    timestamp,
} = format

const logger = createLogger({
    level: config.logs.level ?? 'info',
    format: format.json(),
    transports: (() => {
        const transportStorage = []

        transportStorage.push(new transports.File({ filename: './data/logs.log' }))

        // Always log to console
        transportStorage.push(new transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'MM/DD/YYYY hh:mm:ss A' }),
                printf(({
                    timestamp,
                    level,
                    message,
                }) => `[${timestamp}][Overseer][${level}]: ${message}`),
            ),
        }))

        return transportStorage
    })(),
})

module.exports = logger
