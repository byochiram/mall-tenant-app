require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cron = require('node-cron');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { checkDueDateReminders, checkExpiredContracts } = require('./jobs/reminder.job');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 8 * * *', () => {
    checkDueDateReminders().catch(console.error);
    checkExpiredContracts().catch(console.error);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Mall Tenant Management API running on port ${PORT}`);
    console.log('Reminder scheduler active (runs daily at 08:00)');
  });
}

module.exports = app;
