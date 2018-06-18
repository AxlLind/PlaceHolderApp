module.exports = {
    host: 'localhost',
    port: 3000,
    sessionTime: 1000 * 60 * 10,
    saltRounds: 10,
    dbClient: 'pg',
    dbConn: {
        host: 'localhost',
        user: 'postgres',
        database: 'shopping_list',
    },
    errHandled: 'errHandled',
    emailSender: {
        user: 'axel.ew.lindeberg',
        pass: 'glhf github..',
    }
}
