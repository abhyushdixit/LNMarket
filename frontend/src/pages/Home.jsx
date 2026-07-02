import { useState, useEffect } from 'react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['All', 'Books', 'Calculators', 'Lab coats', 'Electronics', 'Bikes', 'Hostel furniture'];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchListings = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/listings`, {
        params: { search, category }
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings', err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <input
          type="text"
          placeholder="Search items..."
          className="w-full md:w-1/3 bg-charcoal border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-cyber text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                category === cat 
                  ? 'bg-cyber text-charcoal shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No items found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}