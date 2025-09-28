
const express = require('express');
const ViewingController = require('../controllers/viewing.controller');
// const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/', ViewingController.getViewings);


router.post('/', ViewingController.createViewing);


router.get('/me', ViewingController.getMyViewings);


router.get('/:id', ViewingController.getViewingById);


router.get('/user/:userId', ViewingController.getViewingsByUser);


router.get('/landlord/:landlordId', ViewingController.getViewingsByLandlord);


router.put('/:id/status', ViewingController.updateViewingStatus);

// router.post('/:id/confirm', protect, authorize('landlord'), ViewingController.confirmViewing);
router.post('/:id/confirm', ViewingController.confirmViewing);


// router.post('/:id/cancel', protect, ViewingController.cancelViewing);
router.post('/:id/cancel', ViewingController.cancelViewing);


// router.post('/:id/complete', protect, ViewingController.completeViewing);
router.post('/:id/complete', ViewingController.completeViewing);


// router.delete('/:id', protect, ViewingController.deleteViewing);
router.delete('/:id', ViewingController.deleteViewing);

module.exports = router;
