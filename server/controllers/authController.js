import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || 'user',
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Handle Candidate Login
    if (role === 'candidate') {
      const candidate = await Candidate.findOne({ email }).select('+password');
      if (!candidate) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      console.log('candidate', candidate);
      console.log('candidate approved', candidate.isApproved);
      // Check if candidate is approved
      if (!candidate.isApproved) {
        return res.status(403).json({
          message:
            'Your account is not approved by the interviewer yet. Please wait for approval.',
        });
      }

      // Check if password is set
      if (!candidate.password) {
        return res
          .status(400)
          .json({
            message:
              'Your account is not yet activated. Contact your interviewer.',
          });
      }

      // Verify password
      const isPasswordValid = await candidate.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: candidate._id, email: candidate.email, role: 'candidate' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          role: 'candidate',
          position: candidate.position,
          isApproved: candidate.isApproved,
        },
      });
      return;
    }

    // Handle User (Interviewer) Login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
