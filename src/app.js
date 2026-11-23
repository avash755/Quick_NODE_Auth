const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser'); /// for use token from the web
const cors = require('cors'); /// Helps frontend and backend connection. 

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());


app.use('/api/auth', authRoutes);




module.exports = app;