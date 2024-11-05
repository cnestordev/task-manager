const session = require('express-session');
const MongoStore = require('connect-mongo');

const isProduction = process.env.NODE_ENV === "production";

const sessionConfig = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: isProduction ? 7 * 24 * 60 * 60 : 2 * 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        httpOnly: true,
        secure: isProduction,
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sameSite: "None"
    }
});

module.exports = sessionConfig;
