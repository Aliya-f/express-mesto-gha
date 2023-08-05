const http2 = require('http2');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(http2.constants.HTTP_STATUS_OK).send(users);
    })
    .catch(() => {
      res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

module.exports.getUserById = (req, res) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'user not found' });
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: `Получение пользователя с некорректным id: ${id}.` });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

module.exports.createUser = (req, res) => {
  User.create({ ...req.body })
    .then((user) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: `${Object.values(err.errors).map(() => err.message).join(', ')}` });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: `Пользователь по указанному id: ${id} не найден.` });
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: `${Object.values(err.errors).map(() => err.message).join(', ')}` });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: `Пользователь по указанному id: ${id} не найден.` });
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: `${Object.values(err.errors).map(() => err.message).join(', ')}` });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};
