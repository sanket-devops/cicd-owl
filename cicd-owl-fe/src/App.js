import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Login from './components/login/login'
import Dashboard from './components/dashboard/dashboard'

function App() {
  const navigate = useNavigate();




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



// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Hello, You Are Loggedin.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Thank You!
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
