import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import axios from 'axios';

const poolData = {
  UserPoolId: 'us-east-1_OjUVi5IAI',
  ClientId: '4ndqe4ft3kej4g7lbhn8u5r7a1',
};

const userPool = new CognitoUserPool(poolData);

function Test() {
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);

  const jwtToken = localStorage.getItem('jwtToken') || '';

  useEffect(() => {
    if (jwtToken) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [jwtToken]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        'https://l7jotokcza.execute-api.us-east-1.amazonaws.com/prod/orders',
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );
      console.log(response.data);
      setOrders(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Invalid token or not signed in.');
      } else {
        setMessage('Error fetching orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = () => {
    userPool.signUp(email, password, [], null, (err, result) => {
      if (err) {
        setMessage(`Sign up failed: ${err.message}`);
        return;
      }
      setMessage(
        `Sign up successful. Please check your email for the verification code.`,
      );
      setIsVerificationRequired(true);
    });
  };

  const confirmSignUp = () => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        setMessage(`Confirmation failed: ${err.message}`);
        return;
      }
      setMessage('Confirmation successful! You can now sign in.');
      setIsVerificationRequired(false); // Hide verification code input
    });
  };

  const signIn = () => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        localStorage.setItem('jwtToken', token);
        setMessage('Signed in successfully.');
        fetchOrders();
      },
      onFailure: (err) => {
        setMessage(`Sign in failed: ${err.message}`);
      },
    });
  };

  // Sign out function
  const signOut = () => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
      localStorage.removeItem('jwtToken');
      setOrders([]);
      setMessage('Signed out successfully.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="flex flex-col items-center justify-center bg-blue-600 text-white w-full py-6">
        <img src={logo} className="h-20 mb-4" alt="logo" />
        <p className="text-lg">
          Edit <code className="bg-gray-800 p-1 rounded">src/App.js</code> and
          save to reload. Hi Adam Sulemanji!!!
        </p>
      </header>

      <div className="w-full max-w-md mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Sign Up / Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={signUp}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
          <button
            onClick={signIn}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sign In
          </button>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        {isVerificationRequired && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">Enter Verification Code</h2>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <button
              onClick={confirmSignUp}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Confirm Sign Up
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>

      {jwtToken && (
        <div className="w-full max-w-md mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">JWT Token</h2>
          <p className="break-words">{jwtToken}</p>
        </div>
      )}

      {loading ? (
        <p className="mt-4">Loading orders...</p>
      ) : (
        <div className="w-full max-w-md mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Orders:</h2>
          <ul>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <li key={index} className="mb-2">
                  Order ID: {order.orderId} - TimeStamp: {order.timestamp}
                </li>
              ))
            ) : (
              <p>{message}</p>
            )}
          </ul>
        </div>
      )}
      {/* make a button and go to /simple */}
      <button
        className="mt-8 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => (window.location.href = '/simple')}
      >
        Go to Simple Header
      </button>
      <a
        className="mt-8 text-blue-500 hover:underline"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </div>
  );
}

export default Test;
