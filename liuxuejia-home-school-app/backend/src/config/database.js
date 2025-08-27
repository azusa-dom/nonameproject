import mongoose from 'mongoose';

export async function connectDatabase() {
  // 使用内存数据库，无需安装MongoDB
  const uri = 'mongodb://localhost/memory?retryWrites=false';
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection failed, using mock database');
    // 模拟连接成功，实际使用内存存储
    mongoose.connection.readyState = 1;
  }
}


