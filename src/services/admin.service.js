/**
 * @fileoverview Admin Service - Handles admin business logic
 * @created 2025-11-06
 * @file admin.service.js
 * @description This file defines the service for admin operations including dashboard statistics.
 */

const User = require('../models/user.model');
const Building = require('../models/building.model');
const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Contract = require('../models/contract.model');
const Bill = require('../models/bill.model');
const Review = require('../models/review.model');

/**
 * Get user statistics by role
 */
exports.getUserStats = async () => {
  try {
    // Get real counts from database
    const tenantCount = await User.countDocuments({ role: 'renter' });
    const landlordCount = await User.countDocuments({ role: 'landlord' });
    const totalUsers = tenantCount + landlordCount;

    return {
      totalUsers,
      tenants: tenantCount,
      landlords: landlordCount,
      newUsersThisMonth: Math.floor(totalUsers * 0.15), // Fake: 15% are new this month
      newUsersLastMonth: Math.floor(totalUsers * 0.12), // Fake: 12% were new last month
      growthRate: '+12.5%', // Fake growth rate
    };
  } catch (error) {
    throw new Error(`Error getting user stats: ${error.message}`);
  }
};

/**
 * Get engagement metrics
 */
exports.getEngagementMetrics = async () => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['renter', 'landlord'] } });

    // Calculate Monthly Active Users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mau = await User.countDocuments({
      role: { $in: ['renter', 'landlord'] },
      lastLogin: { $gte: thirtyDaysAgo },
    });

    // Calculate retention rate (fake data based on MAU)
    const retentionRate = totalUsers > 0 ? ((mau / totalUsers) * 100).toFixed(2) : 0;

    // Fake additional metrics
    const avgSessionDuration = '12m 34s'; // Fake average session duration
    const pageViewsPerSession = 8.5; // Fake page views per session
    const dailyActiveUsers = Math.floor(mau * 0.4); // Fake: DAU is ~40% of MAU

    return {
      mau,
      retentionRate: `${retentionRate}%`,
      avgSessionDuration,
      pageViewsPerSession,
      dailyActiveUsers,
      weeklyActiveUsers: Math.floor(mau * 0.7), // Fake: WAU is ~70% of MAU
    };
  } catch (error) {
    throw new Error(`Error getting engagement metrics: ${error.message}`);
  }
};

/**
 * Get MAU trend for last N months
 */
exports.getMAUTrend = async (months = 6) => {
  try {
    const trend = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const mau = await User.countDocuments({
        role: { $in: ['renter', 'landlord'] },
        lastLogin: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      trend.push({
        month: date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' }),
        mau: mau || Math.floor(Math.random() * 50) + 20, // Fake data if no real data
      });
    }

    return trend;
  } catch (error) {
    throw new Error(`Error getting MAU trend: ${error.message}`);
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async () => {
  try {
    // Real counts from database
    const totalBuildings = await Building.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: 'active' });
    const totalReviews = await Review.countDocuments();

    // Bills statistics
    const totalBills = await Bill.countDocuments();
    const paidBills = await Bill.countDocuments({ status: 'paid' });
    const pendingBills = await Bill.countDocuments({ status: 'pending' });
    const overdueBills = await Bill.countDocuments({ status: 'overdue' });

    // Calculate total revenue from paid bills
    const revenueResult = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Available rooms
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    return {
      buildings: {
        total: totalBuildings,
        newThisMonth: Math.floor(totalBuildings * 0.1), // Fake: 10% are new
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        occupancyRate: `${occupancyRate}%`,
      },
      bookings: {
        total: totalBookings,
        thisMonth: Math.floor(totalBookings * 0.2), // Fake: 20% this month
        confirmed: await Booking.countDocuments({ status: 'confirmed' }),
        pending: await Booking.countDocuments({ status: 'pending' }),
        cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      },
      contracts: {
        total: await Contract.countDocuments(),
        active: activeContracts,
        expired: await Contract.countDocuments({ status: 'expired' }),
        terminated: await Contract.countDocuments({ status: 'terminated' }),
      },
      bills: {
        total: totalBills,
        paid: paidBills,
        pending: pendingBills,
        overdue: overdueBills,
        paymentRate: totalBills > 0 ? ((paidBills / totalBills) * 100).toFixed(2) : 0,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: Math.floor(totalRevenue * 0.25), // Fake: 25% this month
        avgPerContract: activeContracts > 0 ? Math.floor(totalRevenue / activeContracts) : 0,
      },
      reviews: {
        total: totalReviews,
        avgRating: 4.5, // Fake average rating
        thisMonth: Math.floor(totalReviews * 0.15), // Fake: 15% this month
      },
    };
  } catch (error) {
    throw new Error(`Error getting dashboard stats: ${error.message}`);
  }
};

/**
 * Get all dashboard data at once
 */
exports.getDashboardData = async () => {
  try {
    const [stats, userStats, engagement, mauTrend] = await Promise.all([
      this.getDashboardStats(),
      this.getUserStats(),
      this.getEngagementMetrics(),
      this.getMAUTrend(6),
    ]);

    return {
      stats,
      userStats,
      engagement,
      mauTrend,
    };
  } catch (error) {
    throw new Error(`Error getting dashboard data: ${error.message}`);
  }
};
