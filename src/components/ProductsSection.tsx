import React, { useState } from "react";
import { Search, SlidersHorizontal, Heart, ShoppingBag, X, Star, Sparkles, MessageSquare, Plus, Minus, AlertTriangle } from "lucide-react";
import { Product, Review } from "../types";

interface ProductsSectionProps {
  products: Product[];
  reviews: Review[];
  cart: { product: Product; quantity: number }[];
  onAddToCart: (p: Product, qty: number) => void;
  onAddWishlist: (p: Product) => void;
  wishlist: Product[];
  onSubmitReview: (review: { productId: string; productName: string; customerName: string; rating: number; text: string }) => void;
}

export default function ProductsSection({
  products,
  reviews,
  cart,
  onAddToCart,
  onAddWishlist,
  wishlist,
  onSubmitReview,
}: ProductsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Review form state inside details modal
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Active product image inside modal
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Categories list
  const categories = ["All", "Animal Series", "Food Series", "Cosmic Series", "Custom Initials"];

  // Filter products based on category and search term
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p);
    setActiveImageIndex(0);
    setReviewSuccess(false);
    setReviewName("");
    setReviewText("");
    setReviewRating(5);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || !selectedProduct) return;

    onSubmitReview({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerName: reviewName,
      rating: reviewRating,
      text: reviewText
    });

    setReviewSuccess(true);
    setReviewName("");
    setReviewText("");
    setReviewRating(5);

    // Refresh selectedProduct rating and reviews count locally inside details window
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 pb-12 transition-colors duration-300">
      
      {/* Search and Category Filter Banner */}
      <section className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-6 rounded-2xl border border-pink-100/50 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search custom penguin, clay bunny, letters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-rose focus:border-transparent transition-all"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-brand-rose text-white shadow-sm"
                  : "bg-white hover:bg-pink-50/50 dark:bg-neutral-950 dark:text-gray-300 dark:hover:bg-neutral-800 text-gray-600 border border-pink-100 dark:border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </section>

      {/* Main Grid Banner Header */}
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
          Explore the Keychain Universe
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
          Every purchase supports a local artist in Marathahalli!
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((p, index) => {
            const inWishlist = wishlist.some((w) => w.id === p.id);
            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutOfStock = p.stock === 0;

            const bgs = [
              "bg-[#E1F5FE] dark:bg-sky-950/20", // Light blue
              "bg-[#FCE8E6] dark:bg-rose-950/20", // Light pink
              "bg-[#F3E5F5] dark:bg-purple-950/20", // Light purple
            ];
            const pastelBg = bgs[index % bgs.length];

            return (
              <div
                key={p.id}
                className="bg-[#FFF0F2] dark:bg-neutral-900/60 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-pink-100/50 dark:border-neutral-800/80 p-3 sm:p-5 relative group flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                
                {/* Product Image Area inside cute Pastel Box with White Bordered Thumbnail */}
                <div 
                  onClick={() => handleOpenProduct(p)}
                  className={`w-full aspect-square rounded-xl sm:rounded-[2rem] ${pastelBg} relative cursor-pointer flex items-center justify-center p-3 sm:p-6 overflow-hidden`}
                >
                  {/* Visual Label Tag overlapping top left */}
                  <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 text-[8px] sm:text-[11px] font-bold text-[#E04B73] bg-white dark:bg-neutral-900 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full border border-pink-100 dark:border-neutral-800 shadow-sm flex items-center gap-0.5">
                    <span className="text-[#E04B73] font-black">+</span> {p.tag || "Clay"}
                  </span>

                  {/* Wishlist toggle icon overlapping top right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWishlist(p);
                    }}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2.5 rounded-full bg-white dark:bg-neutral-900 shadow-sm hover:scale-110 transition-transform cursor-pointer text-gray-400 hover:text-brand-rose border border-pink-50 dark:border-neutral-800 flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? "fill-brand-rose text-brand-rose" : ""}`} />
                  </button>

                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-[85%] h-[85%] sm:w-[75%] sm:h-[75%] aspect-square rounded-lg sm:rounded-[1.25rem] object-cover border-2 sm:border-[3px] border-white dark:border-neutral-800 shadow-xs sm:shadow-md transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl sm:rounded-[2rem]">
                      <span className="px-2 py-1 sm:px-3.5 sm:py-1.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Meta details */}
                <div className="space-y-1.5 sm:space-y-2 mt-3 text-left">
                  <h4 
                    onClick={() => handleOpenProduct(p)}
                    className="font-sans text-sm sm:text-lg font-extrabold text-gray-800 dark:text-neutral-100 cursor-pointer hover:text-[#E04B73] transition-colors truncate"
                  >
                    {p.name}
                  </h4>
                  
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-normal">
                    {p.description}
                  </p>

                  {/* Stock status indicator */}
                  <div className="flex items-center gap-1.5 pt-0.5 sm:pt-1">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 rounded-full uppercase">
                        Out of stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 rounded-full uppercase animate-pulse">
                        <AlertTriangle className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> {p.stock} left!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 rounded-full uppercase">
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-pink-50/50 dark:border-neutral-800/60">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-sans text-lg sm:text-2xl font-black text-[#E04B73] dark:text-pink-400">
                          ₹{p.price}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-neutral-500 font-semibold uppercase font-sans">/pc</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                      <a
                        href={`https://wa.me/919640653603?text=Hi%20Hema!%20I'm%20interested%20in%20ordering%20the%20${encodeURIComponent(p.name)}%20for%20INR%20${p.price}.%20Is%20it%20available?`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 sm:p-2.5 bg-[#00C26E]/10 hover:bg-[#00C26E]/20 text-[#00C26E] rounded-full transition-all shadow-xs border border-emerald-100 dark:border-emerald-950/50 flex items-center justify-center shrink-0"
                        title="Inquire on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      </a>

                      <button
                        onClick={() => {
                          if (isOutOfStock) return;
                          onAddToCart(p, 1);
                        }}
                        disabled={isOutOfStock}
                        className={`p-1.5 sm:p-2.5 bg-[#E04B73] hover:bg-brand-rose-dark text-white rounded-full transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer ${
                          isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title="Add to Basket"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (isOutOfStock) return;
                          onAddToCart(p, 1);
                        }}
                        disabled={isOutOfStock}
                        className={`px-2.5 py-1.5 sm:px-5 sm:py-2.5 text-[9px] sm:text-xs font-black tracking-wide text-white rounded-full cursor-pointer transition-all ${
                          isOutOfStock
                            ? "bg-gray-300 dark:bg-neutral-800 cursor-not-allowed"
                            : "bg-[#E04B73] hover:bg-brand-rose-dark shadow-sm hover:scale-105 active:scale-95"
                        }`}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </section>
      ) : (
        <div className="glass-panel dark:bg-neutral-900 p-12 text-center rounded-2xl border border-pink-100">
          <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">No handmade keychains found matching filters.</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
            className="mt-4 px-4 py-2 bg-brand-rose text-white text-xs font-bold rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-pink-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 dark:bg-neutral-800 dark:text-white shadow-md hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Image gallery */}
            <div className="p-6 bg-pink-50/50 dark:bg-neutral-950/20 border-r border-pink-100 dark:border-neutral-800 flex flex-col justify-between">
              
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Image Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto py-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        idx === activeImageIndex ? "border-brand-rose scale-105" : "border-pink-100 dark:border-neutral-800"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badge */}
              <div className="mt-6 flex items-center gap-3 bg-white/80 dark:bg-neutral-900 p-4 rounded-xl border border-pink-100 dark:border-neutral-800">
                <Sparkles className="w-5 h-5 text-brand-rose shrink-0" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed uppercase">
                  Each clay accessory is water-proofed, hand-packaged with custom cards, and dispatched with care.
                </p>
              </div>

            </div>

            {/* Right Column: Details & Reviews */}
            <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-brand-rose bg-brand-rose-light px-2.5 py-1 rounded-full border border-pink-200 uppercase tracking-widest">
                  {selectedProduct.category}
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white leading-tight">
                  {selectedProduct.name}
                </h3>

                {/* Rating summary */}
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(selectedProduct.rating) ? "fill-current" : ""}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white ml-1">
                    {selectedProduct.rating} / 5.0
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({selectedProduct.reviewsCount} verified reviews)
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="flex items-center gap-4 py-2">
                  <span className="font-serif text-3xl font-black text-brand-rose dark:text-pink-400">
                    ₹{selectedProduct.price}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full uppercase">
                    In Stock: {selectedProduct.stock} units
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (selectedProduct.stock === 0) return;
                      onAddToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 py-3 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buy Now / Add to Cart
                  </button>
                </div>
              </div>

              {/* Review section inside product details */}
              <div className="border-t border-pink-50 dark:border-neutral-800 pt-6">
                <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Customer Reviews
                </h4>

                {/* Reviews List */}
                <div className="space-y-4 max-h-[160px] overflow-y-auto mb-6 pr-2">
                  {reviews.filter((r) => r.productId === selectedProduct.id).length > 0 ? (
                    reviews
                      .filter((r) => r.productId === selectedProduct.id)
                      .map((r) => (
                        <div key={r.id} className="bg-pink-50/30 dark:bg-neutral-950/30 p-3 rounded-xl border border-pink-50 dark:border-neutral-800 space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-gray-900 dark:text-white">{r.customerName}</span>
                            <div className="flex text-amber-400">
                              {[...Array(r.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{r.text}"</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No reviews for this product yet. Be the first to review!</p>
                  )}
                </div>

                {/* Submit New Review Form */}
                <form onSubmit={handleReviewSubmit} className="space-y-3 bg-pink-50/10 dark:bg-neutral-950/10 p-4 rounded-xl border border-pink-100/50 dark:border-neutral-800">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Leave a Review</h5>
                  
                  {reviewSuccess ? (
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-center animate-pulse">
                      Thank you! Your feedback supports Hema's micro business!
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Name"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-950 dark:text-white rounded-lg border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-semibold"
                        />
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs font-bold text-gray-500">Rating:</span>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="text-xs bg-white dark:bg-neutral-950 dark:text-white rounded-lg border border-pink-100 dark:border-neutral-800 p-1 font-bold text-amber-500"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ 5</option>
                            <option value="4">⭐⭐⭐⭐ 4</option>
                            <option value="3">⭐⭐⭐ 3</option>
                            <option value="2">⭐⭐ 2</option>
                            <option value="1">⭐ 1</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        placeholder="Write your beautiful review about baking quality or gloss finish..."
                        required
                        rows={2}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-950 dark:text-white rounded-lg border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-rose font-medium"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-neutral-900 hover:bg-black dark:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </>
                  )}
                </form>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
