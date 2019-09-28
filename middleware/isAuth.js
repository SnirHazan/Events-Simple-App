const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  //If there is no Token at all
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1]; //Bearer 'TOKEN'

  //If the is no token
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, 'SomeSuperSecretKey');
  } catch (error) {
    req.isAuth = false;
    return next();
  }

  //if there is no decoded Token
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  //everything is O.K :)
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};
