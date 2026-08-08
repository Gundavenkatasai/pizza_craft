import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateRole = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://venkatasaigunda82:8x25j9dD7g7L2K0V@pizza-craft.rht54.mongodb.net/?retryWrites=true&w=majority&appName=pizza-craft';
    await mongoose.connect(mongoUri);
    const res = await mongoose.connection.db.collection('users').updateMany(
      { $or: [ { email: 'admin@pizzacraft.com' }, { email: 'venkatasaigunda82@gmail.com' }, { role: 'admin' } ] },
      { $set: { role: 'super_admin' } }
    );
    console.log('Update result:', res);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

updateRole();
