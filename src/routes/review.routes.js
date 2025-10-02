const express = require('express');
const {
    createReview,
    getRoomReviews,
    getLandlordReviews,
    getRenterReviews,
} = require('../controllers/review.controller');

const router = express.Router();

router.post('/', createReview);
router.get('/room/:roomId', getRoomReviews);
router.get('/landlord/:landlordId', getLandlordReviews);
router.get('/renter/:renterId', getRenterReviews);

module.exports = router;
