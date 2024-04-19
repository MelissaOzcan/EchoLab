/**
 * @file App.jsx contains the routing logic for the app.
 * 1. /register: Route to register a new user.
 * 2. /login: Route to login an existing user.
 * 3. /home: Route to the home page.
 * 4. /editor/:id: Route to the editor page, redirects to /editor/:id/python until other languages are supported.
 * 5. /editor/:id/python: Route to the Python runner page.
 * 6. *: Catch-all route that redirects to /login.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import PythonRunner from './components/PythonRunner';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/editor/:id" element={<Navigate replace to="/editor/:id/python" />} />
          <Route path="/editor/:id/python" element={<PythonRunner />} />
          <Route path="*" element={<Navigate replace to={"/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
