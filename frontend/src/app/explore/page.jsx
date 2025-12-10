"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ExploreFilters from "../../components/explore/ExploreFilters";
import ExploreHeader from "../../components/explore/ExploreHeader";
import ExploreProductGrid from "../../components/explore/ExploreProductGrid";
import SearchBar from "../../components/search/SearchBar";
import ProductRecommendations from "../../components/search/ProductRecommendations";
import NewsletterSubscription from "../../components/explore/NewsletterSubscription";
import ProductQuickView from "../../components/ui/ProductQuickView";
import { productsBuyer, productSearch } from "../../lib/api";

// Loading component for Suspense fallback
function ExplorePageFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
      <Footer />
    </div>
  );
}

// Component that uses useSearchParams
function ExplorePageContent() {
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState({
    category_id: null,
    brand_id: null,
    min_price: 0,
    max_price: 10000,
    search: "", // Local search (within page)
    urlSearch: "", // URL search (from navbar, uses API)
    tags: []
  });

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // API data state
  const [allProducts, setAllProducts] = useState([]); // All products from API
  const [products, setProducts] = useState([]); // Displayed products (filtered)
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  // Category mapping for URL parameters
  const categoryMapping = {
    "home-living": "Home & Living",
    "fashion": "Fashion", 
    "food-beverage": "Food & Beverage",
    "beauty-personal-care": "Beauty & Personal Care",
    "pets": "Pets",
    "fitness": "Fitness"
  };

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productsBuyer.getCategoriesTree(),
          productsBuyer.getActiveBrands()
        ]);
        
        setCategories(categoriesData || []);
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Handle URL parameters on component mount and when searchParams change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam && categoryMapping[categoryParam]) {
      // Find the category ID by name
      const categoryName = categoryMapping[categoryParam];
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        setActiveFilters(prev => ({
          ...prev,
          category_id: category.id,
          search: "", // Clear local search when URL params change
          urlSearch: searchParam || "" // Store URL search separately
        }));
      }
    } else if (searchParam) {
      // If only search parameter is provided (from navbar search)
      setActiveFilters(prev => ({
        ...prev,
        search: "", // Clear local search
        urlSearch: searchParam, // Store URL search for API call
        category_id: null
      }));
    }
  }, [searchParams, categories]);

  // Fetch products from API when non-search filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build API parameters (exclude local search)
        const params = {
          page: currentPage,
          limit: limit,
          sort_by: sortBy,
          sort_order: sortOrder
        };

        // Add URL search if present (from navbar)
        if (activeFilters.urlSearch && activeFilters.urlSearch.trim()) {
          params.search = activeFilters.urlSearch.trim();
        }

        // Add active filters to params (only if they have values)
        if (activeFilters.category_id) {
          params.category_id = activeFilters.category_id;
        }
        if (activeFilters.brand_id) {
          params.brand_id = activeFilters.brand_id;
        }
        if (activeFilters.min_price > 0) {
          params.min_price = activeFilters.min_price;
        }
        if (activeFilters.max_price < 10000) {
          params.max_price = activeFilters.max_price;
        }

        console.log('Making products API request with params:', params);

        const response = await productsBuyer.listProducts(params);
        
        console.log('Products API response:', response);
        
        // Store all products from API
        setAllProducts(response.items || []);
        setTotalResults(response.total || 0);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilters.category_id, activeFilters.brand_id, activeFilters.min_price, activeFilters.max_price, activeFilters.urlSearch, sortBy, sortOrder, currentPage, limit]);

  // Apply local search filtering to products
  useEffect(() => {
    if (!activeFilters.search || !activeFilters.search.trim()) {
      // No local search, show all products
      setProducts(allProducts);
    } else {
      // Apply local search filter
      const searchTerm = activeFilters.search.toLowerCase().trim();
      const filteredProducts = allProducts.filter(product => {
        return (
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.category?.name?.toLowerCase().includes(searchTerm) ||
          product.brand?.name?.toLowerCase().includes(searchTerm) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });
      setProducts(filteredProducts);
    }
  }, [allProducts, activeFilters.search]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      ...newFilters,
      // Preserve search states unless explicitly overridden
      search: newFilters.search !== undefined ? newFilters.search : prev.search,
      urlSearch: newFilters.urlSearch !== undefined ? newFilters.urlSearch : prev.urlSearch
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (searchQuery) => {
    // For explore page, we search only among currently displayed products (local search)
    setActiveFilters(prev => ({
      ...prev,
      search: searchQuery, // Local search within current products
      urlSearch: "" // Clear URL search when doing local search
    }));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSuggestionSelect = (suggestion) => {
    // Handle different types of suggestions
    if (typeof suggestion === 'object' && suggestion.type) {
      switch (suggestion.type) {
        case 'category':
          setActiveFilters(prev => ({
            ...prev,
            category_id: suggestion.id,
            search: '',
            urlSearch: ''
          }));
          break;
        case 'brand':
          setActiveFilters(prev => ({
            ...prev,
            brand_id: suggestion.id,
            search: '',
            urlSearch: ''
          }));
          break;
        default:
          handleSearch(suggestion.text || suggestion);
      }
    } else {
      handleSearch(suggestion.text || suggestion);
    }
  };

  const handleSortChange = (newSort) => {
    // Extract sort_by and sort_order from the sort value
    if (newSort === "latest") {
      setSortBy("created_at");
      setSortOrder("desc");
    } else if (newSort === "price_low") {
      setSortBy("price");
      setSortOrder("asc");
    } else if (newSort === "price_high") {
      setSortBy("price");
      setSortOrder("desc");
    } else if (newSort === "name") {
      setSortBy("name");
      setSortOrder("asc");
    } else {
      setSortBy("created_at");
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content Wrapper */}
      <div className="relative">
        {/* Fixed Sidebar Filters - Only visible until footer starts */}
        <div className="hidden lg:block fixed left-0 top-[76px] w-80 bg-white border-r border-gray-200 z-10 overflow-hidden" 
             style={{ height: 'calc(100vh - 76px)' }}>
          <div className="h-full overflow-y-auto scrollbar-hide pb-4">
            <ExploreFilters 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              categories={categories}
              brands={brands}
              loading={loading}
            />
          </div>
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* Main Content */}
        <div className="lg:ml-80 relative z-0">
          <div className="pt-[12px]"> 
            {/* Header Section with Filter Button and Sort */}
            <ExploreHeader 
              sortBy={`${sortBy}_${sortOrder}`}
              onSortChange={handleSortChange}
              onToggleFilters={() => setShowFilters(!showFilters)}
              resultsCount={totalResults}
              loading={loading}
            />

            {/* Search Bar Section */}
            <div className="px-4 pb-6">
              <SearchBar
                placeholder="Search for sustainable products..."
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                value={activeFilters.search}
                className="max-w-2xl mx-auto"
              />
            </div>

            {/* Product Grid */}
            <div className="px-4 pt-0 pb-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading products...</div>
                </div>
              ) : products.length > 0 ? (
                <>
                  <ExploreProductGrid 
                    products={products} 
                    loading={loading}
                    onProductClick={handleProductClick}
                  />
                  
                  {/* Show additional recommendations when browsing (not searching) */}
                  {!activeFilters.search && (
                    <div className="mt-16 mb-12">
                      <ProductRecommendations 
                        type="trending" 
                        limit={8}
                        title="Trending Products"
                        className="mb-12"
                      />
                      <ProductRecommendations 
                        type="new-arrivals" 
                        limit={8}
                        title="New Arrivals"
                        className="mb-12"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12">
                  <div className="text-center mb-12">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                      {activeFilters.search 
                        ? `No results for "${activeFilters.search}". Try adjusting your search or filters.`
                        : "Try adjusting your filters to find what you're looking for."
                      }
                    </p>
                    {activeFilters.search && (
                      <button
                        onClick={() => handleSearch('')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                  
                  {/* Show recommendations when no products found */}
                  <ProductRecommendations 
                    type="trending" 
                    limit={8}
                    title="You might like these trending products"
                    className="mb-12"
                  />
                </div>
              )}
            </div>

            {/* Newsletter Subscription */}
            <NewsletterSubscription />
            
            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed left-0 top-0 h-full w-80 bg-white overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Filters</h2>
              <button 
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ExploreFilters 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              categories={categories}
              brands={brands}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {isModalOpen && selectedProduct && (
        <ProductQuickView 
          product={selectedProduct}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// Main component with Suspense wrapper
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExplorePageFallback />}>
      <ExplorePageContent />
    </Suspense>
  );
}
