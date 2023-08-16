const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // верификация токена
    payload = jwt.verify(token, 'unique-secret-key');
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AuthError('Необходима авторизация'));
    }
    return next(err);
  }

  req.user = payload; // записываем пейлоуд в объект запроса
  return next(); // пропускаем запрос дальше
};

module.exports = auth;
