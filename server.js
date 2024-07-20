const express = require('express');
const moongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const usersRoutes = require('./routes/usersRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);

moongoose.connect(process.env.MONGODB)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on Port: ${PORT}`)
        })
    })
    .catch( error => {
        console.log("Error connecting to MongoDB", error)
    });
