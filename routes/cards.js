const router = require('express').Router();
// const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCardById,
  putLikes,
  deleteLikes,
} = require('../controllers/cards');

router.get('/', getCards);
router.delete('/:cardId', deleteCardById);
router.post('/', createCard);
router.put('/:cardId/likes', putLikes);
router.delete('/:cardId/likes', deleteLikes);

module.exports = router;
