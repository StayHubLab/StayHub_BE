import express from 'express';
import { auth, roleMiddleware } from '../middlewares/auth.middleware';
const router = express.Router();

// Property management
router.get('/properties', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Get landlord properties' });
});

router.post('/properties', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Create new property' });
});

router.put('/properties/:id', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Update property' });
});

router.delete('/properties/:id', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Delete property' });
});

// Booking management
router.get('/bookings', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Get landlord bookings' });
});

router.put('/bookings/:id/status', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Update booking status' });
});

// Dashboard
router.get('/dashboard', auth, roleMiddleware('landlord'), (req, res) => {
  res.json({ message: 'Landlord dashboard' });
});

export default router;
