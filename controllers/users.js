const http2 = require('http2');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');
const { getJwtToken } = require('../utils/jwt');

const saltRounds = 10;

// получение списка пользователей
module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

// поиск пользователя по ид
module.exports.getUserById = (req, res, next) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('user not found'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError(`Получение пользователя с некорректным id: ${id}.`));
      }
      return next(err);
    });
};

// создание пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((newUser) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send({
        name: newUser.name, about: newUser.about, avatar: newUser.avatar, email: newUser.email,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        next(new ValidationError(`Проверьте правильность заполнения полей ${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } else if (err.code === 11000) {
        next(new ConflictError(`Пользователь с таким email: ${email} уже существует`));
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
        return next(new NotFoundError(`Пользователь по указанному id: ${id} не найден.`));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`${Object.values(err.errors).map(() => err.message).join(', ')}`));
      }
      return next(err);
    });
};

// изменение аватара
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(`Пользователь по указанному id: ${id} не найден.`));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`${Object.values(err.errors).map(() => err.message).join(', ')}`));
      }
      return next(err);
    });
};

// получает из запроса почту и пароль и проверяет их
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthError(`Такого пользователя ${email} не существует`));
      }
      return bcrypt.compare(password, user.password)
        .then((correctPassword) => {
          if (!correctPassword) {
            return next(new AuthError('Неверный пароль'));
          }
          const token = getJwtToken(
            { _id: user._id },
            { expiresIn: '7d' },
          );
          return res.send({ jwt: token });
        });
    })
    .catch(next);
};

// получениe информации о пользователе
module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('user not found'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Переданы некорректные данные'));
      } if (err.message === 'NotFound') {
        return next(new NotFoundError('user not found'));
      } return next(err);
    });
};
