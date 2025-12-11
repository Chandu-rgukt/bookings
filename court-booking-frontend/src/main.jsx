import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

if (import.meta.env.DEV) {
  axios.defaults.baseURL = 'http://localhost:4000';
}

const token = localStorage.getItem('token');
if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

createRoot(document.getElementById('root')).render(<App />);
