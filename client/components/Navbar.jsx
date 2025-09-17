import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full flex items-center justify-between bg-cyan-700 text-white shadow z-10 px-6 py-3">
      <Link to="/" className="font-bold text-lg tracking-wide">
        The Online Interview Proctor
      </Link>
      <div className="space-x-4 flex items-center">
        {!user && (
          <>
            <Link to="/login" className="hover:text-cyan-200 font-semibold">Login</Link>
            <Link to="/signup" className="hover:text-cyan-200 font-semibold">Sign Up</Link>
          </>
        )}
        {user && (
          <>
            <span className="font-semibold">{user.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="ml-2 px-3 py-1 rounded bg-white text-cyan-700 font-semibold hover:bg-cyan-100">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
