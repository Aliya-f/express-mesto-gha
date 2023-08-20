const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const router = require('./routes');
const { errorHandler } = require('./middlewares/error-handler');
const NotFoundError = require('./errors/NotFoundError');

require('dotenv').config();

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('connected to db');
});

const app = express();

app.use(express.json());
app.use(helmet());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(router);
app.use('*', (next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errors()); // обработчик ошибок celebrate
app.use(errorHandler); // наш централизованный обработчик

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
