import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function Test() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders...');
        const response = await axios.get(
          'https://l7jotokcza.execute-api.us-east-1.amazonaws.com/prod/orders',
        );
        setOrders(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload. Hi Adam Sulemanji !!!
        </p>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div>
            <h2>Orders:</h2>
            <ul>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <li key={index}>
                    Order ID: {order.orderId} - TimeStamp: {order.timestamp}
                  </li>
                ))
              ) : (
                <p>No orders found</p>
              )}
            </ul>
          </div>
        )}

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <h1>Counter</h1>
      <button onClick={() => (window.location.href = '/header')}>
        Go to Headers
      </button>
    </div>
  );
}

export default Test;
