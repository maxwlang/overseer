const { createLogger, format, transports } = require('winston')

const {
    combine,
    colorize,
    printf,
    timestamp,
} = format

const logger = createLogger({
    level: 'info',
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
                }) => `[${timestamp}][Accomplice][${level}]: ${message}`),
            ),
        }))

        return transportStorage
    })(),
})

module.exports = logger
