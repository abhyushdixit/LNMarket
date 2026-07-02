import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Chat from './Chat';

export default function ListingCard({ listing }) {
  const { user } = useContext(AuthContext);
  const [showDetail, setShowDetail] = useState(false); 
  const [currentImgIndex, setCurrentImgIndex] = useState(0); 

  const isOwner = user?.id === (listing.seller?._id || listing.seller);
  const roomId = `${listing._id}_${isOwner ? 'seller_view' : user?.id}`;
  
  const productImages = listing.images && listing.images.length > 0 ? listing.images : [listing.imageUrl];

  const handleNextImage = (e) => {
    e.stopPropagation(); 
    setCurrentImgIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleDeleteListing = async (e) => {
    e.stopPropagation(); 
    if (!window.confirm('Are you sure you want to remove this item from LNMarket?')) return;

    try {
      const token = localStorage.getItem('token'); 
      await axios.delete(`http://localhost:5000/api/listings/${listing._id}`, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      alert('Listing removed successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Delete API Error:', err);
      alert(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  return (
    <>
      {/* HOME FEED GRID CARD GRID ENTRY ITEM */}
      <div 
        onClick={() => {
          setCurrentImgIndex(0); // Reset image index on open
          setShowDetail(true);
        }}
        className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-electric/50 transition-all group flex flex-col cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      >
        <div className="h-48 overflow-hidden relative">
          <img 
            src={productImages[0]} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-2 right-2 bg-charcoal/90 text-cyber text-xs font-bold px-2 py-1 rounded border border-cyber/30">
            {listing.category}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-white truncate">{listing.title}</h3>
          <p className="text-2xl font-extrabold text-electric mt-1">₹{listing.price}</p>
          <p className="text-sm text-gray-400 mt-2 line-clamp-2 flex-grow">{listing.description}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500">Seller: {listing.seller?.name || 'Campus User'}</span>
            <span className="text-xs text-cyber font-medium group-hover:underline">
              {isOwner ? 'Manage →' : 'View Details →'}
            </span>
          </div>
        </div>
      </div>

      {/* OVERLAY DEDICATED EXTENDED DETAILED SPLIT MODAL PANEL */}
      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          
          {/* Backdrop Click Dismiss Wrapper */}
          <div className="absolute inset-0" onClick={() => setShowDetail(false)} />

          {/* Core Content Modal Frame Box (Wide Layout) */}
          <div className="relative w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh] text-white z-10 animate-scale-in">
            
            {/* LEFT HALF SCREEN PANEL: PRODUCT IMAGES & DETAILS DESCRIPTION */}
            <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto border-b md:border-b-0 md:border-r border-gray-800">
              
              {/* Header category badge bar row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs bg-cyber/10 text-cyber border border-cyber/20 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  {listing.category}
                </span>
                <span className="text-xs text-gray-500">
                  Seller: <strong className="text-gray-300">{listing.seller?.name || 'Campus User'}</strong>
                </span>
              </div>

              {/* 📸 CAROUSEL SLIDER LAYER */}
              <div className="relative h-60 min-h-[240px] bg-gray-950 rounded-xl overflow-hidden border border-gray-800 group mb-4">
                <img 
                  src={productImages[currentImgIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-cyber hover:text-black w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors text-xs"
                    >
                      ◀
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-cyber hover:text-black w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors text-xs"
                    >
                      ▶
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-charcoal/90 border border-gray-800 rounded-full px-2 py-0.5 text-[10px] text-gray-300 font-bold">
                      {currentImgIndex + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Title & Pricing layout context components */}
              <h2 className="text-2xl font-black text-white leading-tight">{listing.title}</h2>
              <p className="text-3xl font-black text-electric mt-1">₹{listing.price}</p>
              
              {/* Description Card block layout text window scope area */}
              <div className="mt-4 p-4 bg-gray-950/40 rounded-xl border border-gray-800 flex-1 overflow-y-auto">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">Product Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div className="text-[11px] text-gray-500 mt-3 text-center">
                Contact: {listing.seller?.email || 'Institutional Profile'}
              </div>
            </div>

            {/* RIGHT HALF SCREEN PANEL: SEAMLESS LIVE CHAT STREAM OR OWNER VIEW */}
            <div className="w-full md:w-1/2 bg-gray-950/40 flex flex-col h-full relative">
              
              {/* Top Bar for closing the global panel */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                <span className="text-sm font-bold text-gray-400">
                  {isOwner ? 'Listing Management' : 'Negotiation Channel'}
                </span>
                <button 
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-white text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors font-bold"
                >
                  ✕ Close Window
                </button>
              </div>

              {/* Conditional Bottom Action Segment Frame */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {isOwner ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-4 text-sm font-medium max-w-sm">
                      🛡️ This listing belongs to your account profile. You can remove it from the market registry grid using the deletion action trigger below.
                    </div>
                    <button 
                      onClick={handleDeleteListing}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-lg"
                    >
                      Delete Listing Document
                    </button>
                  </div>
                ) : (
                  /* FIXED: The onClose function now runs () => setShowDetail(false) 
                    so that clicking the close action button inside Chat fully closes the window.
                  */
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <Chat 
                      listing={listing} 
                      roomId={roomId} 
                      onClose={() => setShowDetail(false)} 
                    />
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}