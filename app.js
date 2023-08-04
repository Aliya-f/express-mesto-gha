const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./routes');
require('dotenv').config();

const { PORT, MONGO_URL } = process.env;
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('connected to db');
});

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64c8f77a2ce9845c9b6b9595'
  };
  next();
});
app.use(router);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});
