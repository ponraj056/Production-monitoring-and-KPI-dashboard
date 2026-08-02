require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Production Monitoring API is running' });
});

const PORT = process.env.PORT || 5000;
const machineRoutes = require('./routes/machineRoutes');
app.use('/api/machines', machineRoutes);
const machineRoutes = require('./routes/machineRoutes');
const productionLogRoutes = require('./routes/productionLogRoutes');
const downtimeLogRoutes = require('./routes/downtimeLogRoutes');

app.use('/api/machines', machineRoutes);
app.use('/api/production-logs', productionLogRoutes);
app.use('/api/downtime-logs', downtimeLogRoutes);
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});