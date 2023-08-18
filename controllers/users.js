const http2 = require('http2');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationError');
const { getJwtToken } = require('../utils/jwt');

const saltRounds = 10;

// получение списка пользователей
module.exports.getUsers = (req, res, next) => {
  return User.find()
    .then((users) => {
      res.status(http2.constants.HTTP_STATUS_OK).send(users);
    })
    .catch((err) => {
      next(err);
    });
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

  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then(({ name, about, avatar, email }) => {
      delete password;
      return res.status(http2.constants.HTTP_STATUS_CREATED).send({ name, about, avatar, email });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`Проверьте правильность заполнения полей ${Object.values(err.errors).map(() => err.message).join(', ')}`));
      } else if (err.code === 11000) {
        return next(new ConflictError(`Пользователь с таким email: ${email} уже существует`));
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
          return res.status(http2.constants.HTTP_STATUS_OK).send({ jwt: token });
        });
    })
    .catch((error) => {
      next(error);
    });
};

// получениe информации о пользователе
module.exports.getCurrentUser = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne(email)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('user not found' ));
      } else {
        delete password;
        return res.status(http2.constants.HTTP_STATUS_OK).send(user);
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
