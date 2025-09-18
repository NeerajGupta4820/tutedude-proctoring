
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';

const Signup = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('https://tutedude-proctoring.onrender.com/api/auth/signup', { name, email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100 overflow-hidden font-poppins">
      <img className="fixed left-0 bottom-0 h-full z-0 hidden md:block" src="../assets/wave.png" alt="wave" />
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-16 z-10">
        <div className="img hidden md:flex items-center justify-end">
          <img src="../assets/bg.png" alt="background" className="w-[400px] md:w-[500px]" />
        </div>
        <div className="login-content flex items-center justify-center text-center">
          <form onSubmit={handleSubmit} className="w-80 md:w-96 bg-white rounded-xl shadow-lg p-8">
            <img src="../assets/avatar.svg" alt="avatar" className="h-24 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-cyan-700 uppercase mb-6">Sign Up</h2>
            <div className="relative flex items-center border-b-2 border-gray-300 mb-6 focus-within:border-cyan-700">
              <span className="text-gray-400 mr-3 text-xl"><i className="fas fa-user"></i></span>
              <input type="text" name="name" id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full py-2 px-2 outline-none text-lg bg-transparent" />
            </div>
            <div className="relative flex items-center border-b-2 border-gray-300 mb-6 focus-within:border-cyan-700">
              <span className="text-gray-400 mr-3 text-xl"><i className="fas fa-envelope"></i></span>
              <input type="email" name="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full py-2 px-2 outline-none text-lg bg-transparent" />
            </div>
            <div className="relative flex items-center border-b-2 border-gray-300 mb-6 focus-within:border-cyan-700">
              <span className="text-gray-400 mr-3 text-xl"><i className="fas fa-lock"></i></span>
              <input type="password" name="password" id="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full py-2 px-2 outline-none text-lg bg-transparent" />
            </div>
            <div className="relative flex items-center border-b-2 border-gray-300 mb-6 focus-within:border-cyan-700">
              <span className="text-gray-400 mr-3 text-xl"><i className="fas fa-lock"></i></span>
              <input type="password" name="confirmPassword" id="confirmPassword" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full py-2 px-2 outline-none text-lg bg-transparent" />
            </div>
            {error && <h6 className="text-red-600 mb-2">{error}</h6>}
            <button type="submit" className="btn w-full h-12 rounded-full bg-cyan-700 text-white text-lg font-bold uppercase mt-4 hover:bg-cyan-800 transition">Sign Up</button>
            <div className="mt-4 text-sm">
              Already have an account? <span className="text-cyan-700 cursor-pointer font-semibold" onClick={() => navigate('/login')}>Login</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
