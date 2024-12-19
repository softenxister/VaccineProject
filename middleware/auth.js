const jwt = require("jsonwebtoken");
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false, 
      message: "Not authorized to access this route"
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user by decoded ID
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;

    console.log('Auth header:', req.headers.authorization);
    console.log('Extracted token:', token);
    
    next();
  } catch(err) {
    console.log('Auth Error:', err.message);
    return res.status(401).json({
      success: false, 
      message: "Not authorized to access this route"
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)){
      return res.status(403).json({success: false, message: `User role ${req.user.role} is not authorized to access this route`})
    }
    next()
  }
}