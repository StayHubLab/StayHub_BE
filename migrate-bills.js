/**
 * @fileoverview Bill Migration Script
 * @description Migrates existing bills to add landlordId field
 * Run with: node migrate-bills.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./src/models/bill.model');

async function migrateBills() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database');

    // Find bills without landlordId
    const bills = await Bill.find({ landlordId: { $exists: false } })
      .populate({
        path: 'contractId',
        populate: {
          path: 'roomId',
          populate: {
            path: 'buildingId',
            select: 'hostId',
          },
        },
      })
      .limit(1000); // Process in batches

    console.log(`📊 Found ${bills.length} bills to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const bill of bills) {
      try {
        const landlordId = bill.contractId?.roomId?.buildingId?.hostId;

        if (landlordId) {
          bill.landlordId = landlordId;
          await bill.save();
          updated++;
          console.log(`✓ Updated bill ${bill._id}`);
        } else {
          skipped++;
          console.log(`⚠ Skipped bill ${bill._id} - no landlord found`);
        }
      } catch (err) {
        console.error(`❌ Error updating bill ${bill._id}:`, err.message);
        skipped++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total bills processed: ${bills.length}`);
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ⚠ Skipped: ${skipped}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateBills();
