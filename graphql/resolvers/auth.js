const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

module.exports = {
  createUser: async args => {
    try {
      const user = await User.findOne({email: args.userInput.email});
      if (user) {
        throw new Error('User exists already');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user_1 = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user_1.save();
      return {...result._doc, password: null};
    } catch (err) {
      throw err;
    }
  },
  login: async ({email, password}) => {
    const user = await User.findOne({email: email});
    if (!user) {
      throw new Error('User Does Not Exists');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is Incorrect');
    }
    const token = jwt.sign(
      {userId: user.id, email: user.email},
      'SomeSuperSecretKey',
      {
        expiresIn: '2h'
      }
    );
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 2
    };
  }
};
