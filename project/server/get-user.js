import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne();
  console.log(user);
  mongoose.connection.close();
});
