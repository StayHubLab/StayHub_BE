/**
 * @fileoverview Contact Request Controller
 */

const ContactRequest = require('../models/contact-request.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const Contract = require('../models/contract.model');

// Create a contact request
exports.create = async (req, res, next) => {
  try {
    const { roomId, guestId, status = 'pending', isHandled = false, message } = req.body || {};

    if (!roomId || !guestId) {
      return res.status(400).json({ success: false, message: 'roomId and guestId are required' });
    }

    // Basic existence checks
    const [room, guest] = await Promise.all([
      Room.findById(roomId).select('_id buildingId name'),
      User.findById(guestId).select('_id name email phone'),
    ]);

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    const doc = await ContactRequest.create({
      roomId: room._id,
      guestId: guest._id,
      status,
      isHandled: Boolean(isHandled),
      response: message,
    });

    return res.status(201).json({ success: true, message: 'Contact request created', data: doc });
  } catch (error) {
    next(error);
  }
};

// List contact requests (basic; can be filtered later)
exports.list = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, guestId, status } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const filter = {};
    if (guestId) filter.guestId = guestId;
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      ContactRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate({
          path: 'roomId',
          select: 'name buildingId price',
          populate: {
            path: 'buildingId',
            select: 'name address hostId',
            populate: { path: 'hostId', select: 'name email phone' },
          },
        })
        .populate('guestId', 'name email phone')
        .lean(),
      ContactRequest.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { items, pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) } },
    });
  } catch (error) {
    next(error);
  }
};

// Tenant signs a contact-request (base64)
exports.signAsTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signature } = req.body || {};
    if (!signature) return res.status(400).json({ success: false, message: 'Missing signature' });

    // update request
    const updated = await ContactRequest.findByIdAndUpdate(
      id,
      { $set: { tenantSignature: signature, status: 'approved', isHandled: true } },
      { new: true }
    ).lean();

    if (!updated)
      return res.status(404).json({ success: false, message: 'Contact request not found' });

    // auto create contract
    const room = await Room.findById(updated.roomId).populate({
      path: 'buildingId',
      select: 'hostId name address',
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);

    const contractDoc = await Contract.create({
      renterId: updated.guestId,
      roomId: room._id,
      buildingId: room.buildingId?._id || room.buildingId,
      hostId: room.buildingId?.hostId || undefined,
      startDate,
      endDate,
      status: 'pending',
      terms: {
        rentAmount: room.price?.rent || 0,
        depositAmount: room.price?.deposit || 0,
        paymentDay: 1,
        noticePeriod: 30,
        utilities: [
          { name: 'electricity', price: room.price?.electricity || 0, unit: 'kWh' },
          { name: 'water', price: room.price?.water || 0, unit: 'person' },
        ],
      },
      signatures: { tenant: signature, tenantSignedAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Signed successfully and contract created',
      data: { requestId: updated._id, contractId: contractDoc._id },
    });
  } catch (error) {
    next(error);
  }
};
