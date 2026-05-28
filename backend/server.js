require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// existing routes
const adminRoutes = require('./routes/adminRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const donationRoutes = require('./routes/donationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// ✅ NEW: payment route
const paymentRoutes = require('./routes/paymentRoutes');

connectDB();

const app = express();
app.set('trust proxy', 1); // this is used to get correct client IP when behind a proxy (like in production with services like Heroku ,Render etc.)

// middlewares
app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
app.use(express.json());
app.use('/data', express.static(path.join(__dirname, '..', 'data')));
app.use('/mock-registry', express.static(path.join(__dirname, 'mock-registry')));

// request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

//express-rate-limit configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

app.use('/api', limiter);
// routes
app.use('/api/admin', adminRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ NEW: payment route
app.use('/api/payment', paymentRoutes);

// test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
