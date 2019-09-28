import React, {Component, Fragment} from 'react';
import Modal from '../components/Modal/Modal';
import BackDrop from '../components/BackDrop/BackDrop';
import authContext from '../components/context/auth-context';
import './Events.css';

export default class EventsPage extends Component {
  componentDidMount() {
    this.fetchEvents();
  }

  state = {
    creating: false,
    events: []
  };

  static contextType = authContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descElRef = React.createRef();
  }

  startCreateEventHandler = () => {
    this.setState({creating: true});
  };

  modalConfirmHandler = () => {
    this.setState({creating: false});
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
            mutation {
                createEvent(eventInput:{title:"${title}",description:"${description}",price:${price},date:"${date}"}){
                    _id
                    title
                    description
                    date
                    price
                    creator{
                      _id
                      email
                    }
                }
            }
        `
    };

    const token = this.context.token;
    //Request
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        this.fetchEvents();
      })
      .catch(err => {
        console.log(err);
      });
  };

  modalCancelHandler = () => {
    this.setState({creating: false});
  };

  fetchEvents() {
    const requestBody = {
      query: `
            query {
                events {
                    _id
                    title
                    description
                    price
                    date
                    creator{
                      _id
                      email
                    }
                }
            }
        `
    };

    const token = this.context.token;
    //Request
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        this.setState({events});
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    const eventList = this.state.events.map(event => {
      return (
        <li className="events__list-item" key={event._id}>
          {event.title} - price: {event.price}
        </li>
      );
    });
    return (
      <Fragment>
        {this.state.creating && <BackDrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price:</label>
                <input type="number" id="price" ref={this.priceElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date:</label>
                <input type="datetime-local" id="date" ref={this.dateElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description:</label>
                <textarea rows="4" id="description" ref={this.descElRef} />
              </div>
            </form>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share Your Own Event!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create Event
            </button>
          </div>
        )}
        <ul className="events__list">{eventList}</ul>
      </Fragment>
    );
  }
}
