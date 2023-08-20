const http2 = require('http2');
const Card = require('../models/card');

// отрисовка карточек
module.exports.getCards = (req, res) => {
  Card.find().then((cards) => {
    res.status(http2.constants.HTTP_STATUS_OK).send(cards);
  })
    .catch(() => {
      res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

// создание карточки
module.exports.createCard = (req, res) => {
  const owner = (req.user._id); // _id станет доступен
  const { name, link } = req.body;
  return Card.create({ name, link, owner })
    .then((card) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send(card);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({
          message: `${Object.values(err.errors).map(() => err.message).join(', ')}`,
        });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

// удалить карточку
module.exports.deleteCardById = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  return Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
      }
      if (card.owner.toString() !== _id) {
        return res.status(http2.constants.HTTP_STATUS_FORBIDDEN).send({ message: 'Вы не можете удалить чужую карточку' });
      }
      return Card.findByIdAndRemove(cardId)
        .then(() => {
          res.status(http2.constants.HTTP_STATUS_OK).send({ message: 'Карточка успешно удалена' });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Получение карточки с некорректным id' });
      }
      return next(err);
    });
};

// поставть лайк
module.exports.putLikes = (req, res) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

// удалить лайк
module.exports.deleteLikes = (req, res, next) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
      return next(err);
    });
};
