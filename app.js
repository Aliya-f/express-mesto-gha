// const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const router = require('./routes');
require('dotenv').config();

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('connected to db');
});

const app = express();

app.use(helmet());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64c8f77a2ce9845c9b6b9595',
  };
  next();
});
app.use(router);
app.use('*', (req, res) => {
  res.status(404).send({
    message: 'Страница не найдена',
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
