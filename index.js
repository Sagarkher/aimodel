const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const genderRoutes = require('./routes/genderRoutes');
const bodyRoutes = require('./routes/bodyRoutes');
const skinRoutes = require('./routes/skinRoutes');
const eyeRoutes = require('./routes/eyeRoutes');
const haircolorRoutes = require('./routes/haircolorRoutes');
const hairstyleRoutes = require('./routes/hairstyleRoutes');
const relationshipRoutes = require('./routes/relationshipRoutes');
const personalityRoutes = require('./routes/personalityRoutes');

// const userRouter = require('./Routes/user');
// const eventRouter = require('./Routes/event');
// const restaurantRouter = require('./Routes/restaurant');
// const agoraRouter = require('./Routes/agora');
// const adminRouter = require('./Routes/admin');



const db = require('./config');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure correct path to views
// Middleware
//app.use(cors());

app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Allow all HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']  // Allow necessary headers
}));
// ✅ Increase Payload Limit for Base64 Images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use(
    session({
        secret: 'your_secret_key', // Change this to a secure key
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 86400000 }, // 1 day expiration
    })
);



//app.use(express.static(path.join(__dirname, 'public')));

app.get('/upload/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'upload', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error(`Error serving image: ${err}`);
            res.status(500).send(err);
        }
    });
});


// function getBaseUrl(req) {
//     const baseURL = req.protocol + '://' + req.headers.host + '/';
//     const reqUrl = new URL(req.url, baseURL);
//     return reqUrl;
//   }

  
// Middleware
app.use(cors());
app.use(bodyParser.json());
// app.use('/Neaore/user', userRouter);
// app.use('/Neaore/event', eventRouter);
// app.use('/Neaore/restaurant', restaurantRouter);
// app.use('/Neaore/agora', agoraRouter);
// app.use('/admin', adminRouter);
// Serve static files



app.use('/api/user', userRoutes);
app.use('/api/gender', genderRoutes);
app.use('/api/body', bodyRoutes);
app.use('/api/skin', skinRoutes);
app.use('/api/eye', eyeRoutes);
app.use('/api/haircolor', haircolorRoutes);
app.use('/api/hairstyle', hairstyleRoutes);
app.use('/api/relationship', relationshipRoutes);
app.use('/api/personality', personalityRoutes);


// app.use('/api/user', authRoutes);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.listen(5002, () => {
    console.log('Server connected on port 5002');
});