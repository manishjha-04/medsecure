/**
 * Permit.io API Proxy Server
 * 
 * This server acts as a proxy between the frontend and Permit.io API
 * to resolve CORS issues and handle authentication securely.
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Permit.io API configuration
const PERMIT_API_URL = process.env.VITE_PERMIT_API_URL || 'https://api.permit.io/v2';
const PERMIT_API_KEY = process.env.VITE_PERMIT_API_KEY || 'default_key';

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5174', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Create a proxy middleware for Permit.io API requests
app.use('/api/permit', async (req, res) => {
  try {
    // Get the path part after /api/permit
    const permitPath = req.path;
    
    // Build the full Permit.io API URL
    const permitUrl = `${PERMIT_API_URL}${permitPath}`;
    
    // Forward the request to Permit.io API
    const response = await axios({
      method: req.method,
      url: permitUrl,
      data: req.body,
      headers: {
        'Authorization': `Bearer ${PERMIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Send the response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Permit.io API proxy error:', error.message);
    
    // Send error response to client
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: true,
        message: error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: true, 
        message: 'No response from Permit.io API'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
});

// Serve static files for the frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Permit.io proxy server running on port ${PORT}`);
  console.log(`Proxying requests to ${PERMIT_API_URL}`);
}); 