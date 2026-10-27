import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB for Admin seeding');

    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;
    const adminName = env.ADMIN_NAME;

    if (!adminEmail || !adminPassword) {
      console.error('[Seed Error] ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment.');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin already exists with email: ${adminEmail}`);
      // Ensure role is Admin and user is active
      existingAdmin.role = 'Admin';
      existingAdmin.isActive = true;
      existingAdmin.passwordHash = await User.hashPassword(adminPassword);
      await existingAdmin.save();
      console.log(`[Seed] Updated and verified Admin credentials for: ${adminEmail}`);
    } else {
      const passwordHash = await User.hashPassword(adminPassword);
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'Admin',
        isActive: true,
      });
      console.log(`[Seed] Created new Administrator account: ${newAdmin.email}`);
    }

    console.log('[Seed Admin] Finished successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] Failed to seed admin: ${err.message}`);
    process.exit(1);
  }
};

seedAdmin();
