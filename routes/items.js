import express from 'express';
import {Item} from '../models/Item.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// In-memory storage as fallback when MongoDB is not available
let itemsStorage = [];
let itemIdCounter = 1;

// Helper function to simulate MongoDB operations
const simulateDB = {
  save: (item) => {
    const newItem = { ...item, _id: itemIdCounter++, dateReported: new Date() };
    itemsStorage.push(newItem);
    return Promise.resolve(newItem);
  },
  find: (query = {}) => {
    let filtered = [...itemsStorage];
    
    if (query.status) filtered = filtered.filter(item => item.status === query.status);
    if (query.category && query.category !== 'all') {
      filtered = filtered.filter(item => item.category === query.category);
    }
    
    return Promise.resolve(filtered.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported)));
  }
};

// Get all items with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (category && category !== 'all') query.category = category;
    
    let items;
    
    try {
      // Try MongoDB first
      if (status || category) {
        items = await Item.find(query).sort({ dateReported: -1 });
      } else {
        items = await Item.find({}).sort({ dateReported: -1 });
      }
    } catch (error) {
      // Fallback to in-memory storage
      items = await simulateDB.find(query);
    }
    
    // Apply text search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create new item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, category, status, location,
      contactName, contactEmail, contactPhone, dateOccurred
    } = req.body;
    
    const itemData = {
      title,
      description,
      category,
      status,
      location,
      contactName,
      contactEmail,
      contactPhone,
      dateOccurred: new Date(dateOccurred),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    };
    
    let newItem;
    
    try {
      // Try MongoDB first
      const item = new Item(itemData);
      newItem = await item.save();
    } catch (error) {
      // Fallback to in-memory storage
      newItem = await simulateDB.save(itemData);
    }
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create item' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    let item;
    
    try {
      // Try MongoDB first
      item = await Item.findById(req.params.id);
    } catch (error) {
      // Fallback to in-memory storage
      item = itemsStorage.find(item => item._id == req.params.id);
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

export default router;