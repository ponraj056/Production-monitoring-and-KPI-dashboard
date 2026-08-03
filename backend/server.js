require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // for development; restrict this in production
  },
});

app.use(cors());
app.use(express.json());

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

app.get('/', (req, res) => {
  res.json({ message: 'Production Monitoring API is running' });
});

const PORT = process.env.PORT || 5000;

const machineRoutes = require('./routes/machineRoutes');
const productionLogRoutes = require('./routes/productionLogRoutes');
const downtimeLogRoutes = require('./routes/downtimeLogRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

app.use('/api/machines', machineRoutes);
app.use('/api/production-logs', productionLogRoutes);
app.use('/api/downtime-logs', downtimeLogRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const { startSimulator } = require('./simulator');

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

startSimulator(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});