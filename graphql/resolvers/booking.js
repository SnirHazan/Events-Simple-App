const Booking = require('../../models/Booking');
const Event = require('../../models/Event');
const {tranformEvent, transformBooking} = require('./merge');

const events = async eventIds => {
  try {
    const events = await Event.find({_id: {$in: eventIds}});
    return events.map(event => {
      return tranformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const bindUser = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      password: null,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return tranformEvent(event);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  booking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('User is Unauthenticated!');
    }
    try {
      const bookings = await Booking.find({user: req.userId});
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (error) {
      console.log(error);
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('User is Unauthenticated!');
    }
    const fetchedEvent = await Event.findOne({_id: args.eventId});
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },

  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('User is Unauthenticated!');
    }
    try {
      const booking = await Booking.findById({_id: args.bookingId}).populate(
        'event'
      );
      const event = tranformEvent(booking.event);
      await Booking.deleteOne({_id: args.bookingId});
      return event;
    } catch (error) {
      throw error;
    }
  }
};
