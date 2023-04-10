import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Login from './components/login/login'
import Dashboard from './components/dashboard/dashboard'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/login' element={<Login />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='*' element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;