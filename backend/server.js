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
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const auditRoutes = require('./routes/auditRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/machines', machineRoutes);
app.use('/api/production-logs', productionLogRoutes);
app.use('/api/downtime-logs', downtimeLogRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/public', publicRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const { startSimulator } = require('./simulator');
const { initPredictionsJob } = require('./controllers/predictionsController');
const { initAlertJob } = require('./jobs/alertJob');

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

startSimulator(io);
initPredictionsJob(io);
initAlertJob();

const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this command to free it, then try again:`);
    console.error(`   PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});