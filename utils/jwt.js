const jwt = require('jsonwebtoken');
// const User = require('../models/user');

const { JWT_SECRET = 'SECRET' } = process.env;

module.exports.getJwtToken = (payload) => {
  const jwtSign = jwt.sign(payload, JWT_SECRET);
  return jwtSign;
};

// module.exports.isAuth = (token) => {
//   const decodedFunction = (err, decoded) => {
//     if (err) return false;
//     return User.findById(decoded._id)
//       .then((user) => {
//         Boolean(user);
//       })
//       .catch(() => false);
//   };
//   const jwtVerify = jwt.verify(token, JWT_SECRET, decodedFunction);
//   return jwtVerify;
// };
