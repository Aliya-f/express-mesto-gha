const router = require('express').Router();
const userRouter = require('./users');
const cardsRouter = require('./cards');

router.use('/users', userRouter);
router.use('/cards', cardsRouter);

module.exports = router;
