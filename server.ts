// backend-ts-app/server.ts
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import cors from 'cors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 4000;

// JWT Secret Key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

console.log('Setting up middleware...');

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect('mongodb://localhost:27017/legal-judgment-db');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connected successfully');
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Simple User Schema (inline for testing)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Passport Local Strategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email as username field
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      console.log('Passport Local Strategy: Authenticating user:', email);
      
      // Find user by email in the database
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found in database');
        return done(null, false, { message: 'Invalid email or password' });
      }

      console.log('User found, comparing passwords...');
      // Compare password with the hashed password in database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Password comparison failed');
        return done(null, false, { message: 'Invalid email or password' });
      }

      console.log('Authentication successful for user:', user._id);
      return done(null, user);
    } catch (error) {
      console.error('Local strategy error:', error);
      return done(error);
    }
  }
));

// Passport JWT Strategy for token authentication
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    try {
      console.log('JWT Strategy: Verifying token for user ID:', payload.id);
      
      const user = await User.findById(payload.id).select('-password');
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error('JWT strategy error:', error);
      return done(error, false);
    }
  }
));

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!' });
});

// Simplified Signup Endpoint
app.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  
  const { name, username, email, password, confirmPassword } = req.body;
  
  // Use name as username if username is not provided (frontend sends 'name')
  const usernameField = username || name;

  // Validation
  if (!usernameField || !email || !password || !confirmPassword) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    console.log('Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    console.log('Password too short');
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Invalid email format');
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    console.log('Hashing password...');
    // Hash password with salt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating new user...');
    // Create new user
    const newUser = new User({ 
      username: usernameField, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    console.log('User created successfully:', newUser._id);
    
    // Return success response (excluding password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email
    };
    
    res.status(201).json({ 
      message: 'Account created successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating account', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Signin Endpoint with Passport.js and JWT
app.post('/signin', (req, res, next) => {
  console.log('Signin request received:', req.body);
  
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Use Passport Local Strategy for authentication
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error('Passport authentication error:', err);
      return res.status(500).json({ 
        message: 'Authentication error', 
        error: err.message 
      });
    }

    if (!user) {
      console.log('Authentication failed:', info?.message);
      return res.status(401).json({ 
        message: info?.message || 'Invalid email or password' 
      });
    }

    console.log('Authentication successful, generating JWT...');

    // Create JWT payload
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username
    };

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '1h',
      issuer: 'legal-judgment-app',
      audience: 'legal-judgment-users'
    });

    // Update user's last login time
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() })
      .then(() => console.log('Updated last login time for user:', user._id))
      .catch(err => console.error('Error updating last login:', err));

    console.log('JWT generated successfully for user:', user._id);

    // Return success response with JWT token
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: new Date()
    };
    
    res.status(200).json({ 
      message: 'Signin successful', 
      user: userResponse,
      token: token,
      expiresIn: '1h',
      tokenType: 'Bearer'
    });

  })(req, res, next);
});

// Protected route example - Token verification endpoint
app.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('Token verification successful for user:', (req.user as any)._id);
  
  const user = req.user as any;
  res.json({
    valid: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// Protected Dashboard endpoint
app.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('Dashboard access granted for user:', (req.user as any)._id);
  
  const user = req.user as any;
  res.json({
    message: 'Welcome to your dashboard!',
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    },
    dashboardData: {
      totalDocuments: 0,
      recentActivity: [],
      bookmarks: []
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
