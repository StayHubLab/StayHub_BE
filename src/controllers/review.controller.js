
console.log('✅ Review Controller loaded');
const Review = require('../models/review.model');

exports.createReview = async (req, res) => {
  try {
    const { targetType, roomId, landlordId, renterId, rating, comment } = req.body;

    // Check đã review trước đó chưa
    const existed = await Review.findOne({
      targetType,
      renterId,
      ...(targetType === 'room' && { roomId }),
      ...(targetType === 'landlord' && { landlordId }),
    });

    if (existed) {
      return res.status(400).json({ message: 'Bạn đã đánh giá rồi' });
    }

    const review = await Review.create({
      targetType,
      roomId,
      landlordId,
      renterId,
      rating,
      comment,
    });

    res.status(201).json({ message: 'Đánh giá thành công', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ targetType: 'room', roomId })
      .populate('renterId', 'name avatar');

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ averageRating: avgRating, total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandlordReviews = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const reviews = await Review.find({ targetType: 'landlord', landlordId })
      .populate('renterId', 'name avatar');

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ averageRating: avgRating, total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRenterReviews = async (req, res) => {
  try {
    const { renterId } = req.params;
    const reviews = await Review.find({ renterId });
    res.json({ total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
