const http2 = require('http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');

const SALT_ROUNDS = 10;

// получение списка пользователей
module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(http2.constants.HTTP_STATUS_OK).send(users);
    })
    .catch(next);
};

// поиск пользователя по ид
module.exports.getUserById = (req, res, next) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('user not found'));
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`Получение пользователя с некорректным id: ${id}.`));
      } else {
        next(err);
      }
    });
};

// создание пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        next(new ValidationError(`Пожалуйста, проверьте правильность заполнения полей ${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

// изменение инфы профиля
module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${id} не найден.`));
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(`${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } else {
        next(err);
      }
    });
};

// изменение аватара
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${id} не найден.`));
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(`${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } else {
        next(err);
      }
    });
};

// получает из запроса почту и пароль и проверяет их
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Не передан email или пароль'));
  }
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Такого пользователя не существует'));
      }
      return bcrypt.compare(password, user.password)
        .then((correctPassword) => {
          if (!correctPassword) {
            return next(new UnauthorizedError('Неверный пользователь или пароль.'));
          }
          const token = jwt.sign(
            { _id: user._id },
            { expiresIn: '7d' },
          );
          return res.send({ jwt: token });
        });
    })
    .catch((error) => {
      next(error);
    });
};

// получениe информации о пользователе
module.exports.getCurrentUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('user not found'));
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('user not found'));
      } else next(err);
    });
};
