import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Books', 'Calculators', 'Lab coats', 'Electronics', 'Bikes', 'Hostel furniture'];

export default function AddListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // Array to store multiple selected files

  // Handle file picker selection change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert('You can only upload a maximum of 5 images.');
      e.target.value = ''; // Reset input element
      setImages([]);
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimum validation constraint check
    if (images.length === 0) {
      alert('Please upload at least 1 image for your product.');
      return;
    }

    // Initialize multi-part binary stream builder
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);

    // Append up to 5 image assets matching your Multer field listener key 'images'
    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token'); // Grab JWT string from cache
      
      await axios.post('http://localhost:5000/api/listings', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`, // Match your backend auth.js middleware setup
          'Content-Type': 'multipart/form-data' // Instruct browser to frame files securely
        }
      });
      
      navigate('/');
    } catch (err) {
      console.error('Error adding listing:', err);
      alert(err.response?.data?.message || 'Failed to add listing');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-4">
        Post a New <span className="text-cyber">Listing</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input 
            type="text" required
            value={title}
            className="w-full bg-charcoal border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-electric text-white"
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Price & Category grid row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Price (₹)</label>
            <input 
              type="number" required min="0"
              value={price}
              className="w-full bg-charcoal border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-electric text-white"
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <select 
              className="w-full bg-charcoal border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-electric text-white"
              onChange={e => setCategory(e.target.value)}
              value={category}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Description textbox textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea 
            required rows="4"
            value={description}
            className="w-full bg-charcoal border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-electric text-white resize-none"
            onChange={e => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* File Picker input field section */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Upload Images <span className="text-xs text-gray-500">(Minimum 1, Maximum 5)</span>
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="w-full bg-charcoal border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-electric text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-cyber hover:file:bg-gray-700 cursor-pointer"
            onChange={handleFileChange}
          />
          {images.length > 0 && (
            <p className="text-xs text-cyber mt-1.5 font-medium">
              ✓ {images.length} item{images.length > 1 ? 's' : ''} staged for marketplace delivery
            </p>
          )}
        </div>

        {/* Submission element button */}
        <button 
          type="submit" 
          className="w-full bg-electric hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(109,40,217,0.4)] mt-4"
        >
          Publish Listing
        </button>
      </form>
    </div>
  );
}