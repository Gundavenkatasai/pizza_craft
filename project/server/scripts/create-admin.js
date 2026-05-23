import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// User Schema
const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  email_verified: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@pizzacraft.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Role:', existingAdmin.role);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password_hash: hashedPassword,
        phone: '1234567890',
        role: 'admin',
        email_verified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('\n📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Role: admin');
    }

    console.log('\n🎉 You can now login to the admin dashboard with these credentials');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
