require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { checkDueDateReminders } = require('./jobs/reminder.job');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

cron.schedule('0 8 * * *', () => {
  checkDueDateReminders().catch(console.error);
});

app.listen(PORT, () => {
  console.log(`Mall Tenant Management API running on port ${PORT}`);
  console.log('Reminder scheduler active (runs daily at 08:00)');
});
