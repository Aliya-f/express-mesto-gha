const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validationRegex = require('../utils/validationRegex');

const {
  getCards,
  createCard,
  deleteCardById,
  putLikes,
  deleteLikes,
} = require('../controllers/cards');

router.get('/', getCards);

router.delete(
  '/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  deleteCardById,
);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().regex(validationRegex),
    }),
  }),
  createCard,
);

router.put(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  putLikes,
);

router.delete(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  deleteLikes,
);

module.exports = router;
