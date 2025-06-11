import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Alternative development
  process.env.FRONTEND_URL, // Production
].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 4000;

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://maikersito200109:futbolmania16@cluster0.cibytm2.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', (err as Error).message);
    console.log('The app will continue with limited functionality');
  }
};

// Start server
connectMongoDB();
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
