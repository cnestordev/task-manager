const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 2 * 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        maxAge: 2 * 24 * 60 * 60 * 1000
    }
});

module.exports = sessionConfig;
