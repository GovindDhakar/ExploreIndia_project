const Campground = require('./model/campground');
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./model/review');

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("req.user", req.user)
    if (!req.isAuthenticated()) {
        // store the url they are requesting
        //   console.log(req.path, req.originalUrl)
        req.session.returnToUrl = req.originalUrl;
        req.flash('error', 'You must signed in');
        return res.redirect('/login')
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    const { error } = result;
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash('error', 'Sorry, You cannot have permission to do that');
        return res.redirect(`/destinations/${id}`)
    } else {
        next()
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user.id)) {
        req.flash('error', 'Sorry, You cannot have permission to do that');
        return res.redirect(`/destinations/${id}`)
    } else {
        next()
    }
}

