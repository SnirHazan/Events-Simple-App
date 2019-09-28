const Event = require('../../models/Event');
const User = require('../../models/User');
const {dateToString} = require('../../helpers/date');

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

const tranformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: bindUser.bind(this, event.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
    user: bindUser.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event)
  };
};

// exports.bindUser = bindUser;
// exports.events = events;
// exports.singleEvent = singleEvent;
exports.tranformEvent = tranformEvent;
exports.transformBooking = transformBooking;
