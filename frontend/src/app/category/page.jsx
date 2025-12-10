"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  Filter,
  Star,
  Heart,
  ShoppingCart,
  Leaf,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
  Search
} from "lucide-react";

const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

const categories = {
  all: 'Explore All Products',
  'zerowaste': 'Zero Waste Essentials',
  'fashion': 'Sustainable Fashion',
  'upcycled': 'Upcycled & Repurposed',
  'beauty': 'Conscious Beauty',
  'green-tech': 'Green Technology'
};

const mockProducts = [
  { id: 1, name: "Bamboo Kitchen Utensil Set", price: 1299, originalPrice: 1899, image: "https://placehold.co/300x200/e9d5ff/4c1d95?text=Bamboo", rating: 4.8, reviews: 234, ecoScore: "95%", badges: ["Zero Waste", "Renewable"], category: "zerowaste" },
  { id: 2, name: "Organic Cotton Bedsheet Set", price: 2999, originalPrice: 4499, image: "https://placehold.co/300x200/99f6e4/042f2e?text=Cotton+Bedding", rating: 4.9, reviews: 456, ecoScore: "92%", badges: ["Organic", "Fair Trade"], category: "fashion" },
  { id: 3, name: "Hemp Yoga Mat", price: 2199, originalPrice: 2899, image: "https://placehold.co/300x200/a7f3d0/065f46?text=Hemp+Mat", rating: 4.7, reviews: 189, ecoScore: "94%", badges: ["Natural", "Biodegradable"], category: "zerowaste" },
  { id: 4, name: "Recycled PET Water Bottle", price: 499, originalPrice: 799, image: "https://placehold.co/300x200/bae6fd/0369a1?text=Recycled+Bottle", rating: 4.6, reviews: 567, ecoScore: "89%", badges: ["Recycled", "BPA Free"], category: "zerowaste" },
  { id: 5, name: "Linen Trousers - Earth Dye", price: 1899, originalPrice: 2499, image: "https://placehold.co/300x200/fecaca/991b1b?text=Linen+Pants", rating: 4.6, reviews: 567, ecoScore: "89%", badges: ["Organic", "Fair Trade"], category: "fashion" },
  { id: 6, name: "Natural Face Serum", price: 1599, originalPrice: 2199, image: "https://placehold.co/300x200/fce7f3/9d174d?text=Vegan+Serum", rating: 4.9, reviews: 345, ecoScore: "96%", badges: ["Cruelty-Free", "Vegan"], category: "beauty" },
  { id: 7, name: "Organic Quinoa 1kg", price: 649, originalPrice: 849, image: "https://placehold.co/300x200/ffedd5/9a3412?text=Quinoa", rating: 4.8, reviews: 123, ecoScore: "93%", badges: ["Certified Organic", "Gluten-Free"], category: "zerowaste" },
  { id: 8, name: "Upcycled Denim Tote Bag", price: 999, originalPrice: 1499, image: "https://placehold.co/300x200/bfdbfe/1e3a8a?text=Denim+Tote", rating: 4.7, reviews: 112, ecoScore: "90%", badges: ["Upcycled", "Handmade"], category: "upcycled" },
  { id: 9, name: "Refillable Toothpaste Tablets", price: 599, originalPrice: 799, image: "https://placehold.co/300x200/ccfbf1/0f766e?text=Toothpaste", rating: 4.8, reviews: 401, ecoScore: "98%", badges: ["Zero Waste", "Plastic-Free"], category: "zerowaste" },
  { id: 10, name: "Vintage Silk Scarf Dress", price: 4500, originalPrice: 5500, image: "https://placehold.co/300x200/fef3c7/a16207?text=Vintage+Dress", rating: 4.9, reviews: 55, ecoScore: "88%", badges: ["Upcycled", "Unique"], category: "upcycled" },
  { id: 11, name: "Solid Shampoo Bar - Citrus", price: 449, originalPrice: 699, image: "https://placehold.co/300x200/f0f9ff/0c4a6e?text=Shampoo+Bar", rating: 4.7, reviews: 290, ecoScore: "97%", badges: ["Palm-Oil Free", "Vegan"], category: "beauty" },
  { id: 12, name: "Modular Desk Lamp - Bamboo/LED", price: 5999, originalPrice: 7500, image: "https://placehold.co/300x200/f5d0fe/701a75?text=LED+Lamp", rating: 4.4, reviews: 42, ecoScore: "87%", badges: ["Low Energy", "Durable"], category: "green-tech" },
  { id: 13, name: "Fair Trade Alpaca Sweater", price: 6999, originalPrice: 9500, image: "https://placehold.co/300x200/fefce8/78350f?text=Alpaca+Sweater", rating: 4.5, reviews: 67, ecoScore: "91%", badges: ["Ethical", "Natural Fiber"], category: "fashion" },
];

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center px-2 py-0.5 font-semibold rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>{children}</span>;
}

function Button({ children, className = "", ...props }) {
  return (
    <button {...props} className={`inline-flex items-center justify-center h-10 px-4 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors ${className}`}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

function ProductCard({ product, viewMode }) {
  if (viewMode === 'list') {
    return (
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-xl" />
          <div className="space-y-1">
            <h3 className="font-semibold text-neutral-800 text-lg">{product.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{product.rating} ({product.reviews})</span>
              <Badge>{product.ecoScore}</Badge>
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              {product.badges.map((b) => (
                <Badge key={b}>{b}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[150px]">
          <span className="text-2xl font-bold text-emerald-700">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
          <Button className="mt-2">
            <ShoppingCart className="w-4 h-4 mr-2" /> Cart
          </Button>
        </div>
      </Card>
    );
  }
  return (
    <Card className="group overflow-hidden">
      <div className="relative h-48">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <button className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-white hover:text-red-500">
          <Heart className="w-4 h-4" />
        </button>
        <div className="absolute top-3 left-3">
          <Badge className="bg-emerald-700 text-white border-emerald-700">{product.ecoScore}</Badge>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-neutral-800 text-lg">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{product.rating}</span>
            <span className="text-gray-500">({product.reviews})</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {product.badges.slice(0,2).map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-700">{formatPrice(product.price)}</span>
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700">
            <Leaf className="w-3 h-3" /> Eco
          </div>
        </div>
        <Button className="w-full">
          <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
        </Button>
      </div>
    </Card>
  );
}

export default function CategoryIndexPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);

  const categoryName = categories[currentCategory] || categories['all'];
  const categoryTagline = currentCategory === 'all'
    ? 'Curated for a greener planet, browse our full ethical collection.'
    : 'Sustainable essentials for a better you and a healthier Earth.';

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'eco-score', label: 'Best Eco Score' }
  ];

  const filterOptions = {
    badges: ['Zero Waste', 'Organic', 'Renewable', 'Fair Trade', 'Cruelty-Free', 'Vegan', 'Recycled', 'Gluten-Free', 'Upcycled', 'Handmade', 'Durable', 'Plastic-Free'],
    rating: ['4+ Stars']
  };

  const finalProducts = useMemo(() => {
    let products = mockProducts;
    if (currentCategory !== 'all') {
      products = products.filter(p => p.category === currentCategory);
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.badges.some(b => b.toLowerCase().includes(s)) ||
        p.category.toLowerCase().includes(s)
      );
    }
    products = products.filter(p => {
      const badgeOk = selectedBadges.length === 0 || selectedBadges.every(b => p.badges.includes(b));
      const ratingOk = selectedRating.length === 0 || selectedRating.some(r => r === '4+ Stars' ? p.rating >= 4 : true);
      return badgeOk && ratingOk;
    });
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'eco-score': return parseInt(b.ecoScore) - parseInt(a.ecoScore);
        case 'popularity':
        default: return b.reviews - a.reviews;
      }
    });
  }, [currentCategory, searchTerm, selectedBadges, selectedRating, sortBy]);

  const handleBadgeChange = (badge) => {
    setSelectedBadges(prev => prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]);
  };
  const handleRatingChange = (rating) => {
    setSelectedRating(prev => prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]);
  };
  const clearAllFilters = () => {
    setCurrentCategory('all');
    setSelectedBadges([]);
    setSelectedRating([]);
    setSearchTerm('');
  };

  const FilterSidebar = ({ isMobile }) => (
    <aside className={`w-full lg:w-80 space-y-6 p-6 lg:p-0 ${isMobile ? 'h-full overflow-y-auto' : 'hidden lg:block'}`}>
      <div className="lg:sticky lg:top-4 space-y-6">
        <h3 className="font-extrabold text-2xl text-neutral-800 flex items-center justify-between">
          <span className='flex items-center gap-2'><SlidersHorizontal className="w-5 h-5 text-emerald-700" /> Filter & Category</span>
          <button onClick={clearAllFilters} className="text-sm text-red-500 hover:text-red-700">Clear All</button>
        </h3>
        <Card className="p-4 space-y-1">
          <h4 className="font-bold text-base text-neutral-800 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            Product Categories
          </h4>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {Object.entries(categories).map(([slug, name]) => (
              <button
                key={slug}
                onClick={() => setCurrentCategory(slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${currentCategory === slug ? 'bg-emerald-700 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <h4 className="font-bold text-base text-neutral-800 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-700" /> Eco Certifications
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterOptions.badges.map((badge) => (
              <label key={badge} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-emerald-700 border-gray-300 rounded" checked={selectedBadges.includes(badge)} onChange={() => handleBadgeChange(badge)} />
                <span className="text-sm text-neutral-600">{badge}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <h4 className="font-bold text-base text-neutral-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Customer Rating
          </h4>
          <div className="space-y-2">
            {filterOptions.rating.map((rating) => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-emerald-700 border-gray-300 rounded" checked={selectedRating.includes(rating)} onChange={() => handleRatingChange(rating)} />
                <span className="text-sm text-neutral-600">{rating}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="text-sm text-neutral-500">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-800 font-medium">{categoryName}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="w-full min-h-[140px] rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow">
          <div className="text-center p-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{categoryName}</h1>
            <p className="text-lg sm:text-xl font-medium mt-1 opacity-90">{categoryTagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between p-3 my-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-neutral-600">
            Showing <span className="font-semibold text-neutral-800">{finalProducts.length}</span> products
          </div>
          <div className="text-xs text-neutral-500 hidden sm:block">
            {selectedBadges.length > 0 && (<span className="mr-3">{selectedBadges.length} badge filter(s)</span>)}
            {selectedRating.length > 0 && (<span>{selectedRating.length} rating filter(s)</span>)}
          </div>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar isMobile={false} />
          </div>

          {isFilterOpen && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden">
              <div className="p-4 border-b flex justify-end">
                <button onClick={() => setIsFilterOpen(false)} className="px-3 py-1 rounded-lg text-neutral-700 hover:bg-neutral-100">Close</button>
              </div>
              <FilterSidebar isMobile={true} />
            </div>
          )}

          <main className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products, keywords, or badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsFilterOpen(true)} className="lg:hidden border border-gray-300 rounded-xl px-3 py-2 text-sm">
                  <span className="inline-flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</span>
                </button>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none text-sm border border-gray-300 rounded-xl pl-3 pr-8 py-2 bg-white text-neutral-800 focus:ring-2 focus:ring-emerald-600">
                    {sortOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                </div>
                <div className="flex border border-gray-300 rounded-xl bg-white">
                  <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded-l-xl ${viewMode === 'grid' ? 'bg-emerald-700 text-white' : 'text-neutral-600'}`}><Grid3X3 className="w-4 h-4" /></button>
                  <div className="w-px bg-gray-300" />
                  <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-r-xl ${viewMode === 'list' ? 'bg-emerald-700 text-white' : 'text-neutral-600'}`}><LayoutList className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {finalProducts.map((p) => (
                <div key={p.id}><ProductCard product={p} viewMode={viewMode} /></div>
              ))}
              {finalProducts.length === 0 && (
                <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                  <Leaf className="w-10 h-10 mx-auto text-emerald-600 mb-4" />
                  <p className="text-xl font-medium text-neutral-800">No products found!</p>
                  <p className="text-neutral-500">Try adjusting your filters, category, or search term.</p>
                </div>
              )}
            </div>

            {finalProducts.length > 0 && (
              <div className="text-center pt-2">
                <button className="border border-gray-300 rounded-xl px-4 py-2 text-sm hover:bg-neutral-50">Load More Products</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
