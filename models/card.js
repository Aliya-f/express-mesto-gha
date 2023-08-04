const mangoose = require('mongoose');
const { Schema } = require('mongoose');

const cardSchema = new Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    reference: 'user',
    //required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    reference: 'user',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mangoose.model('Card', cardSchema)