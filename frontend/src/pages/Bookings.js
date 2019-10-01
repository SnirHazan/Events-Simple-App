import React, {Component} from 'react';
import authContext from '../components/context/auth-context';
import Spinner from '../components/Spinner/Spinner';
import BookingsList from '../components/Bookings/BookingsList/BookingsList';

export default class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: []
  };
  static contextType = authContext;

  componentDidMount() {
    this.fetchBooking();
  }

  fetchBooking = () => {
    this.setState({isLoading: true});
    const requestBody = {
      query: `
          query {
              booking {
                  _id
                  createdAt
                  event{
                    _id
                    title
                    date
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
        const booking = resData.data.booking;
        this.setState({bookings: booking, isLoading: false});
        console.log(booking);
      })
      .catch(err => {
        console.log(err);
        this.setState({isLoading: false});
      });
  };

  deleteBookingHandler = bookingId => {
    this.setState({isLoading: true});
    const requestBody = {
      query: `
          mutation CancelBooking($id:ID!) {
            cancelBooking(bookingId: $id) {
                  _id
                  title
              }
          }
      `,
      variables: {
        id: bookingId
      }
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
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(
            booking => booking._id !== bookingId
          );
          return {bookings: updatedBookings, isLoading: false};
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({isLoading: false});
      });
  };
  render() {
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <ul>
            <BookingsList
              bookings={this.state.bookings}
              onDelete={this.deleteBookingHandler}
            />
          </ul>
        )}
      </React.Fragment>
    );
  }
}
