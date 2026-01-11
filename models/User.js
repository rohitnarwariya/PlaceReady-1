
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String },
  skills: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'senior', 'admin'], 
    default: 'user' 
  },
  // Senior Professional Profile
  college: { type: String },
  graduationYear: { type: Number },
  currentCompany: { type: String },
  linkedinUrl: { type: String },
  bio: { type: String },
  isVerified: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
