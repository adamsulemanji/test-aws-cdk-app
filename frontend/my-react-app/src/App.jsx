import React from 'react';
import './components/simpleHeader';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimpleHeader from './components/simpleHeader';
import Test from './components/test';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Test />} />
        <Route exact path="/header" element={<SimpleHeader />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
