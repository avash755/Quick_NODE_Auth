const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser'); /// for use token from the web
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());


app.use('/api/auth', authRoutes);




module.exports = app;