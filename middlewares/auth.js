const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
const { isAuth } = require('../utils/jwt');

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!isAuth(token)) {
    return next(new AuthError('Необходима авторизация'));
  }
  // let payload;

  // try {
  //   // верификация токена
  //   payload = jwt.verify(token, 'unique-secret-key');
  // } catch (err) {
  //   if (err.name === 'JsonWebTokenError') {
  //     return next(new AuthError('Необходима авторизация'));
  //   }
  //   return next(err);
  // }

  // req.user = payload; // записываем пейлоуд в объект запроса
  // return next(); // пропускаем запрос дальше
};

module.exports = auth;
