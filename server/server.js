require('./config/config');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// application/json
app.use(bodyParser.json());

/** Routes configuration */
app.use(require('./routes/index.js'));


mongoose.connect(process.env.MONGO_DB_URL, (err, res) => {
    if (err) throw err;

    console.log('Connected to DB!!!');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
});