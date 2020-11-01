const mongoose = require('mongoose');
const KEYS = require('./config/keys');
const process = require('process');
const app = require('./app');
const User = require('./models/user');

async function start() {

    if(process.env.NODE_ENV === 'production') {
        if(!process.env.DATABASE_URL_STRING) {
            console.log('Please provide database url string');
            process.exit(1);
        }

        if(!process.env.COOKIE_KEY) {
            console.log('Please provide cookie secret');
            process.exit(1);
        }

        if(!process.env.SEND_GRID_API_KEY) {
            console.log('Please provide sendgrid api key');
            process.exit(1);
        }

        if(!process.env.JWT_SECRET) {
            console.log('Please provide jwt secret');
            process.exit(1);
        }
    }

    try {
        await mongoose.connect(KEYS.databaseURLString,{
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to database');
        const port = process.env.PORT || 5000;
    
        app.listen(port, () => {
            console.log('listening on port ' + port);
        });
    }
    catch (err) {
        console.log('Error connecting to server ' + err);
    }
}

start();