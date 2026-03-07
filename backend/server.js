require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const donationRoutes = require('./routes/donationRoutes');
const chatRoutes = require('./routes/chatRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
