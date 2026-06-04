const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const passport = require('passport');

dotenv.config();
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [undefined, 'null', 'http://localhost:5500', 'http://localhost:3000', 'http://localhost:5000', 'https://ianda.netlify.app', 'https://ianda-backend.onrender.com'];
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(null, true); // Allow all in development
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/oauth', require('./routes/oauth'));
app.use('/api/seed', require('./routes/seed'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
