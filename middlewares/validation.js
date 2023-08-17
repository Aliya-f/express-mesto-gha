// const { celebrate, Joi } = require('celebrate');
// const isUrl = require('validator/lib/isURL');
// const BadRequestError = require('../errors/BadRequestError'); // 400

// // валидания ссылок
// const validationUrl = (url) => {
//   const validate = isUrl(url);
//   if (validate) {
//     return url;
//   }
//   throw new BadRequestError('Некорректный адрес URL');
// };
// // валидация ID
// const validationID = (id) => {
//   if (/^[0-9a-fA-F]{24}$/.test(id)) {
//     return id;
//   }
//   throw new BadRequestError('Передан некорретный id.');
// };

// // авторизация
// module.exports.validationLogin = celebrate({
//   body: Joi.object().keys({
//     email: Joi.string().required().email(),
//     password: Joi.string().required(),
//   }),
// });
// // регистрация
// module.exports.validationCreateUser = celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().min(2).max(30),
//     about: Joi.string().min(2).max(30),
//     avatar: Joi.string().custom(validationUrl),
//     email: Joi.string().required().email(),
//     password: Joi.string().required(),
//   }),
// });
// // обновление данных пользователя
// module.exports.validationUpdateUser = celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().min(2).max(30).required(),
//     about: Joi.string().min(2).max(30).required(),
//   }),
// });
// // обновление аватара
// module.exports.validationUpdateAvatar = celebrate({
//   body: Joi.object().keys({
//     avatar: Joi.string().required().custom(validationUrl),
//   }),
// });
// // поиск по ID
// module.exports.validationUserId = celebrate({
//   params: Joi.object().keys({
//     userId: Joi.string().required().custom(validationID),
//   }),
// });
// // создание карточки
// module.exports.validationCreateCard = celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().min(2).max(30).required(),
//     link: Joi.string().required().custom(validationUrl),
//   }),
// });
// // поиск карточки по Id
// module.exports.validationCardById = celebrate({
//   params: Joi.object().keys({
//     cardId: Joi.string().required().custom(validationID),
//   }),
// });


const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

module.exports.validateRegisterBody = celebrate({
  body: {
    email: Joi.string().required().email().messages({
      'any.required': 'Поле email обязательно',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Поле password обязательно',
    }),
    name: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля 2 символа',
      'string.max': 'Максимальная длина поля 30 символов',
    }),
    about: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля 2 символа',
      'string.max': 'Максимальная длина поля 30 символов',
    }),
    avatar: Joi.string().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Не валидная ссылка');
    }).messages({
      'any.required': 'Поле link обязательно',
    }),
  },
});

module.exports.validateAuthBody = celebrate({
  body: {
    email: Joi.string().required().email().messages({
      'any.required': 'Поле email обязательно',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Поле password обязательно',
    }),
  },
});

module.exports.validateCardBody = celebrate({
  body: {
    name: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Минимальная длина поля 2 символа',
        'string.max': 'Максимальная длина поля 30 символов',
        'any.required': 'Поле name обязательно',
      }),
    link: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Не валидная ссылка');
    }).messages({
      'any.required': 'Поле link обязательно',
    }),
  },
});

module.exports.validateAvatarBody = celebrate({
  body: {
    avatar: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Не валидная ссылка');
    }).messages({
      'any.required': 'Поле link обязательно',
    }),
  },
});

module.exports.validateUserId = celebrate({
  params: {
    userId: Joi.string().required().custom((value, helpers) => {
      if (validator.isMongoId(value)) {
        return value;
      }
      return helpers.message('ID должен быть строкой из 24 шестнадцатеричных символов или целым числом');
    }),
  },
});

module.exports.validateCardId = celebrate({
  params: {
    cardId: Joi.string().required().custom((value, helpers) => {
      if (validator.isMongoId(value)) {
        return value;
      }
      return helpers.message('ID должен быть строкой из 24 шестнадцатеричных символов или целым числом');
    }),
  },
});

module.exports.validateUpdateUser = celebrate({
  body: {
    name: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Минимальная длина поля 2 символа',
        'string.max': 'Максимальная длина поля 30 символов',
      }),
    about: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Минимальная длина поля 2 символа',
        'string.max': 'Максимальная длина поля 30 символов',
      }),
  },
});
