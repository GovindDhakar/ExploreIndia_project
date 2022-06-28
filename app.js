if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
//console.log(process.env.CLOUDINARY_SECRET)

const express = require('express');
const app = express();
const path = require('path');
const Joi = require('joi');
const session = require('express-session')
const flash = require('connect-flash')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const passport = require('passport')
const passportLocal = require('passport-local')
const User = require('./model/user')

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const dburl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const MongoDBStore = require("connect-mongo")(session);

main().catch(err => console.log("Connection Error", err));


async function main() {
    await mongoose.connect(dburl);
    console.log("Database Connected")
}

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true })); // to parse the body for post request
app.use(mongoSanitize())
app.use(helmet({ contentSecurityPolicy: false }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dburl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionOptions = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionOptions))
app.use(flash())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dssbf89wa/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
); 


app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => { // for flash
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'govind@gmail.com', username: 'govind' })
    const newUser = await User.register(user, 'dhakad')
    res.send(newUser)
})

app.use('/', userRoutes)
app.use('/destinations', campgroundRoutes)
app.use('/destinations/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 404, message = 'something went wrong' } = err;
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})