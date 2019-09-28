const Event = require('../../models/Event');
const User = require('../../models/User');
const {tranformEvent} = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return tranformEvent(event);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createEvent: async (args, req) => {
    console.log('here');
    if (!req.isAuth) {
      throw new Error('User is Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = tranformEvent(result);
      const user = await User.findById(req.userId);
      if (!user) throw new Error('User does not exists');
      user.createdEvents.push(event);
      await user.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
