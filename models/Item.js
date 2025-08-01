import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Keys', 'Bags', 'Books', 'Other']
  },
  status: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  dateOccurred: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searches
itemSchema.index({ category: 1, status: 1, location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

export const Item = mongoose.model('Item', itemSchema);