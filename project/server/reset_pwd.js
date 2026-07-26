import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('password123', 12);
  // Also clear any plain 'password' field if it exists, to ensure bcrypt is used
  await User.updateOne({email: 'venkatasaigunda82@gmail.com'}, { $set: {password_hash: hash}, $unset: {password: ""} });
  console.log('Password forcefully reset to password123.');
  process.exit(0);
}

reset().catch(console.error);
