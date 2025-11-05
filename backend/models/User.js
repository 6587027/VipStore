// backend/models/User.js 
const mongoose = require('mongoose');

// 🆕 Address Profile Schema
const addressProfileSchema = new mongoose.Schema({
  profileId: {
    type: String,
    required: true
  },
  profileName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [30, 'Profile name cannot exceed 30 characters']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  address: {
    street: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { 
      type: String, 
      required: true,
      match: [/^[0-9]{5}$/, 'Postal code must be 5 digits']
    },
    country: { type: String, default: 'Thailand' },
    notes: { type: String, default: '' }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [30, 'First name cannot exceed 30 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [30, 'Last name cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
    // Note: In production, hash this password with bcrypt before saving
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  // 🆕 Address Profiles Array (Max 5)
  addressProfiles: {
    type: [addressProfileSchema],
    validate: {
      validator: function(profiles) {
        return profiles.length <= 5;
      },
      message: 'Maximum 5 address profiles allowed'
    },
    default: []
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'addressProfiles.profileId': 1 });

// Method to get public profile (without password)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// 🆕 Method to add address profile
userSchema.methods.addAddressProfile = function(profileData) {
  if (this.addressProfiles.length >= 5) {
    throw new Error('Maximum 5 address profiles allowed');
  }

  // Generate unique profile ID
  const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // If this is the first profile, make it default
  const isDefault = this.addressProfiles.length === 0 || profileData.isDefault;

  // If setting as default, unset other defaults
  if (isDefault) {
    this.addressProfiles.forEach(profile => {
      profile.isDefault = false;
    });
  }

  const newProfile = {
    profileId,
    profileName: profileData.profileName,
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    phone: profileData.phone,
    address: profileData.address,
    isDefault,
    createdAt: new Date()
  };

  this.addressProfiles.push(newProfile);
  return newProfile;
};

// 🆕 Method to update address profile
userSchema.methods.updateAddressProfile = function(profileId, updateData) {
  const profile = this.addressProfiles.id(profileId) || 
                  this.addressProfiles.find(p => p.profileId === profileId);
  
  if (!profile) {
    throw new Error('Address profile not found');
  }

  // Update fields
  Object.keys(updateData).forEach(key => {
    if (key !== 'profileId') { // Don't allow changing profileId
      profile[key] = updateData[key];
    }
  });

  // Handle default setting
  if (updateData.isDefault) {
    this.addressProfiles.forEach(p => {
      p.isDefault = p.profileId === profileId;
    });
  }

  return profile;
};

// 🆕 Method to delete address profile
userSchema.methods.deleteAddressProfile = function(profileId) {
  const profileIndex = this.addressProfiles.findIndex(p => p.profileId === profileId);
  
  if (profileIndex === -1) {
    throw new Error('Address profile not found');
  }

  const wasDefault = this.addressProfiles[profileIndex].isDefault;
  this.addressProfiles.splice(profileIndex, 1);

  // If deleted profile was default, set first remaining as default
  if (wasDefault && this.addressProfiles.length > 0) {
    this.addressProfiles[0].isDefault = true;
  }

  return true;
};

// 🆕 Method to get default address profile
userSchema.methods.getDefaultAddressProfile = function() {
  return this.addressProfiles.find(profile => profile.isDefault) || 
         this.addressProfiles[0] || 
         null;
};

// Static method to find user by username or email
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });
};

// Pre-save middleware (for future password hashing)
userSchema.pre('save', function(next) {
  // In production, hash password here with bcrypt if it's modified
  if (this.isModified('password')) {
    // TODO: Hash password with bcrypt
    // this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;