import React, { useState } from 'react';

function SimpleHeader() {
  const [count, setCount] = useState(0);

  const handleTitleClick = () => {
    window.location.href = '/';
  };

  return (
    <header className="bg-blue-500 text-white p-4">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={handleTitleClick}
      >
        Simple Header
      </h1>
      <div className="mt-4 flex items-center">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => setCount(count - 1)}
        >
          -
        </button>
        <span className="text-xl">{count}</span>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </header>
  );
}

export default SimpleHeader;
