const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load configurations
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, restrict this to the frontend URL
    methods: ['GET', 'POST', 'DELETE']
  }
});

// Store io instance on app so controllers can access it
app.set('io', io);

// Connect to Database
connectDB().then(() => {
  // Seed initial Admin and Teacher if database is empty
  seedData();
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP restrictions for development / loading images from many domains
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', apiLimiter);

// Mount Routes
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', sessionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VisionLearn API is running' });
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  // Listen for classroom room subscription
  socket.on('join-classroom', (classroomName) => {
    if (classroomName) {
      const roomName = classroomName.toLowerCase().replace(/\s+/g, '-');
      socket.join(roomName);
      console.log(`Socket [${socket.id}] joined room [${roomName}]`);
      socket.emit('joined', { room: roomName });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Seed function for default login details
async function seedData() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'System Admin',
        email: 'admin@visionlearn.com',
        password: 'adminpassword'
      });
      console.log('Seeded default Admin: admin@visionlearn.com / adminpassword');
    }

    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      await Teacher.create({
        name: 'Jane Doe',
        email: 'teacher@visionlearn.com',
        password: 'teacherpassword',
        subject: 'Science',
        classrooms: ['Classroom A', 'Classroom B', 'Classroom C']
      });
      console.log('Seeded default Teacher: teacher@visionlearn.com / teacherpassword');
    }
  } catch (err) {
    console.error('Data seeding failed:', err.message);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
