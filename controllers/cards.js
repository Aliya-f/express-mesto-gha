const http2 = require('http2');
const Card = require('../models/card');

// отрисовка карточек
module.exports.getCards = (req, res) => {
  return Card.find().then((cards) => {
    return res.status(http2.constants.HTTP_STATUS_OK).send(cards);
  })
  .catch((err) => {
    return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error')
  })
}

// создание карточки
module.exports.createCard = (req, res) => {
  const { owner } = (req.user._id); // _id станет доступен
  const { name, link } = req.body;
  return Card.create({ name, link, owner })
    .then((card) => {
      return res.status(http2.constants.HTTP_STATUS_CREATED).send(card)
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError") {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({
          message: `${Object.values(err.errors).map((err) => err.message).join(", ")}`
        })
      }
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
};

// удалить карточку
module.exports.deleteCardById = (req, res) => {
  const { cardId } = req.params;
  return Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' })
      }
      return Card.findByIdAndRemove(cardId)
        .then((removedCard) => res.status(http2.constants.HTTP_STATUS_OK).send(removedCard))
        .catch(() => {
          return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
        });
  })
  .catch(() => {
    return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error')
  })
};

// поставть лайк
module.exports.putLikes = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' })
      }
      return Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true },
      )
        .then(() => res.status(http2.constants.HTTP_STATUS_OK).send(card))
        .catch(() => {
          return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send('Переданы некорректные данные для постановки лайка')}
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
}

// удалить лайк
module.exports.deleteLikes = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' })
      }
      return Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true },
      )
        .then(() => res.status(http2.constants.HTTP_STATUS_OK).send(card))
        .catch(() => {
          return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send('Переданы некорректные данные для постановки лайка')}
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Server error');
    });
}
