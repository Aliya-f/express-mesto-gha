const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validationRegex = require('../utils/validationRegex');

const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get(
  '/me',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  getCurrentUser,
);

router.get(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  getUserById,
);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateProfile,
);

router.patch(
  '/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().regex(validationRegex),
    }),
  }),
  updateAvatar,
);

module.exports = router;
