const express = require('express')
const router = express.Router({ mergeParams: true });// important
const catchAsync = require('../utils/catchAsync')
const Campground = require('../model/campground');
const Review = require('../model/review');
const reviews = require('../controllers/reviews')
const { reviewSchema } = require('../schemas.js')
const ExpressError = require('../utils/ExpressError')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router