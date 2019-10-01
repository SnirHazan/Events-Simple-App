const DateLoader = require('dataloader');
const Event = require('../../models/Event');
const User = require('../../models/User');
const {dateToString} = require('../../helpers/date');

const eventLoader = new DateLoader(eventIds => {
  console.log(eventIds);
  return events(eventIds);
});

const userLoader = new DateLoader(userIds => {
  return User.find({_id: {$in: userIds}});
});

const events = async eventIds => {
  try {
    const events = await Event.find({_id: {$in: eventIds}});
    events.sort((a, b) => {
      return (
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
      );
    });
    return events.map(event => {
      return tranformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const bindUser = async userId => {
  try {
    const user = await userLoader.load(userId.toString());
    const r = user._doc.createdEvents.map(event => event.toString());
    return {
      ...user._doc,
      password: null,
      createdEvents: () => eventLoader.loadMany(r)
    };
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
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
