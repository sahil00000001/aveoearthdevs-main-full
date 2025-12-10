// Modular API client for FastAPI backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const VERIFICATION_API_BASE = process.env.NEXT_PUBLIC_VERIFICATION_API_BASE || "http://localhost:8001";

// Generic request handler for JSON requests
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  // Only add Authorization header if token is provided and not null/undefined
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (data) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) {
        // FastAPI/Pydantic validation errors
        message = data.detail
          .map((d) => (d?.msg ? `${d.msg}${d?.loc ? ` at ${d.loc.join('.')}` : ''}` : JSON.stringify(d)))
          .join("; ");
      } else if (data.message) message = data.message;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// File upload handler for multipart/form-data requests
async function uploadRequest(path, { method = "POST", formData, token } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Don't set Content-Type header for FormData - browser will set it with boundary

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (data) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((d) => (d?.msg ? `${d.msg}${d?.loc ? ` at ${d.loc.join('.')}` : ''}` : JSON.stringify(d)))
          .join("; ");
      } else if (data.message) message = data.message;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// File upload handler for verification service (port 8001)
async function verificationUploadRequest(path, { method = "POST", formData, token } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Don't set Content-Type header for FormData - browser will set it with boundary

  const res = await fetch(`${VERIFICATION_API_BASE}${path}`, {
    method,
    headers,
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (data) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((d) => (d?.msg ? `${d.msg}${d?.loc ? ` at ${d.loc.join('.')}` : ''}` : JSON.stringify(d)))
          .join("; ");
      } else if (data.message) message = data.message;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const auth = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  loginPhone: (phone, password) => request("/auth/login-phone", { method: "POST", body: { phone, password } }),
  sendOtp: (phone) => request("/auth/send-otp", { method: "POST", body: { phone } }),
  verifyOtp: (phone, otp_code) => request("/auth/verify-otp", { method: "POST", body: { phone, otp_code } }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (new_password, token) => request("/auth/reset-password", { method: "POST", body: { new_password }, token }),
  getProfile: (token) => {
    // Use provided token or get from storage
    const authToken = token || tokens.get()?.access_token;
    if (!authToken) {
      throw new Error("No authentication token available");
    }
    return request("/auth/me", { method: "GET", token: authToken });
  },
  refreshToken: (token) => request("/auth/refresh-token", { method: "POST", token }),
  
  // Profile Management
  updateProfile: (data, token) => request("/auth/me", { method: "PUT", body: data, token }),
  updateCompleteProfile: (data, token) => request("/auth/complete", { method: "PUT", body: data, token }),
  
  // Address Management
  getAddresses: (token) => request("/addresses", { method: "GET", token }),
  createAddress: (data, token) => request("/addresses", { method: "POST", body: data, token }),
  updateAddress: (addressId, data, token) => request(`/addresses/${addressId}`, { method: "PUT", body: data, token }),
  deleteAddress: (addressId, token) => request(`/addresses/${addressId}`, { method: "DELETE", token }),
  setDefaultAddress: (addressId, token) => request(`/addresses/${addressId}/set-default`, { method: "PATCH", token }),
  getDefaultAddress: (addressType, token) => request(`/addresses/default/${addressType}`, { method: "GET", token }),
};

// Supplier Onboarding API
export const supplierOnboarding = {
  getStatus: (token) => request("/supplier/onboarding/status", { method: "GET", token }),
  
  // Business Profile
  createBusiness: (data, token) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return uploadRequest("/supplier/onboarding/business-profile", { method: "POST", formData, token });
  },
  
  updateBusiness: (data, token) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return uploadRequest("/supplier/onboarding/business-profile", { method: "PUT", formData, token });
  },
  
  getBusiness: (token) => request("/supplier/onboarding/business-profile", { method: "GET", token }),
  
  // Safe version of getBusiness that returns null if not found
  getBusinessSafe: async (token) => {
    try {
      return await request("/supplier/onboarding/business-profile", { method: "GET", token });
    } catch (error) {
      // Return null if business not found (404), but throw other errors
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  // Complete Onboarding
  completeOnboarding: (data, token) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return uploadRequest("/supplier/onboarding/complete", { method: "POST", formData, token });
  },
  
  // File Uploads
  uploadLogo: (file, token) => {
    const formData = new FormData();
    formData.append("logo", file);
    return uploadRequest("/supplier/onboarding/upload-logo", { method: "POST", formData, token });
  },
  
  uploadBanner: (file, token) => {
    const formData = new FormData();
    formData.append("banner", file);
    return uploadRequest("/supplier/onboarding/upload-banner", { method: "POST", formData, token });
  },
  
  // Documents
  getDocuments: (token) => request("/supplier/onboarding/documents", { method: "GET", token }),
  deleteDocument: (documentId, token) => request(`/supplier/onboarding/document/${documentId}`, { method: "DELETE", token }),
  
  // Sustainability
  createSustainability: (data, token) => request("/supplier/onboarding/sustainability", { method: "POST", body: data, token }),
  getSustainability: (token) => request("/supplier/onboarding/sustainability", { method: "GET", token }),
  updateSustainability: (data, token) => request("/supplier/onboarding/sustainability", { method: "PUT", body: data, token }),
  
  // Assets
  listAssets: (token) => request("/supplier/onboarding/assets", { method: "GET", token }),
  deleteAsset: (fileName, token) => request(`/supplier/onboarding/assets/${fileName}`, { method: "DELETE", token }),
};

// Products API - Supplier
export const productsSupplier = {
  createProduct: (data, token) => {
    // Convert data to FormData since backend expects multipart/form-data
    const formData = new FormData();
    
    console.log('Creating product with data:', data);
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        // Handle images array
        console.log(`Adding ${value.length} images to FormData`);
        value.forEach((image, index) => {
          if (image instanceof File) {
            console.log(`Adding image ${index + 1}: ${image.name} (${image.type})`);
            formData.append('images', image);
          } else {
            console.warn(`Image ${index + 1} is not a File object:`, image);
          }
        });
      } else if (value !== null && value !== undefined && key !== 'images') {
        // Handle other fields, convert objects/arrays to JSON strings
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Debug: Log all FormData entries
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    
    return uploadRequest("/supplier/products", { method: "POST", formData, token });
  },
  listProducts: (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/supplier/products${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, { method: "GET", token });
  },
  getProduct: (productId, token) => request(`/supplier/products/${productId}`, { method: "GET", token }),
  updateProduct: (productId, data, token) => request(`/supplier/products/${productId}`, { method: "PUT", body: data, token }),
  deleteProduct: (productId, token) => request(`/supplier/products/${productId}`, { method: "DELETE", token }),
  publishProduct: (productId, token) => request(`/supplier/products/${productId}/publish`, { method: "POST", token }),
  
  // Product Images
  uploadImages: (productId, files, token) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    return uploadRequest(`/supplier/products/${productId}/images`, { method: "POST", formData, token });
  },
  
  // Inventory
  updateInventory: (productId, data, token) => request(`/supplier/products/${productId}/inventory`, { method: "PUT", body: data, token }),
  
  // Analytics & Reports
  getAnalytics: (token) => request("/supplier/products/analytics/overview", { method: "GET", token }),
  getLowStock: (token) => request("/supplier/products/inventory/low-stock", { method: "GET", token }),
  
  // Categories & Brands
  getCategories: (token) => request("/products/categories/tree", { method: "GET", token }),
  getBrands: (token) => request("/products/brands/active", { method: "GET", token }),

  // Product Variants
  createVariant: (productId, data, token) => {
    // Convert data to FormData since backend expects multipart/form-data
    const formData = new FormData();
    
    console.log('Creating variant with data:', data);
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        // Handle images array
        console.log(`Adding ${value.length} images to FormData`);
        value.forEach((image, index) => {
          if (image instanceof File) {
            console.log(`Adding image ${index + 1}: ${image.name} (${image.type})`);
            formData.append('images', image);
          }
        });
      } else if (value !== null && value !== undefined && key !== 'images') {
        // Handle other fields, convert objects/arrays to JSON strings
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    return uploadRequest(`/supplier/products/${productId}/variants`, { method: "POST", formData, token });
  },
  getVariants: (productId, token) => request(`/supplier/products/${productId}/variants`, { method: "GET", token }),
  updateVariant: (productId, variantId, data, token) => request(`/supplier/products/${productId}/variants/${variantId}`, { method: "PUT", body: data, token }),
  deleteVariant: (productId, variantId, token) => request(`/supplier/products/${productId}/variants/${variantId}`, { method: "DELETE", token }),
  createVariant: (productId, data, token) => {
    // Convert data to FormData since backend expects multipart/form-data
    const formData = new FormData();
    
    console.log('Creating product variant with data:', data);
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        // Handle images array
        value.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'dimensions' && typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && key !== 'images') {
        formData.append(key, value.toString());
      }
    });
    
    return uploadRequest(`/supplier/products/${productId}/variants`, { method: "POST", formData, token });
  },
  getVariants: (productId, token) => request(`/supplier/products/${productId}/variants`, { method: "GET", token }),
  updateVariant: (productId, variantId, data, token) => request(`/supplier/products/${productId}/variants/${variantId}`, { method: "PUT", body: data, token }),
  deleteVariant: (productId, variantId, token) => request(`/supplier/products/${productId}/variants/${variantId}`, { method: "DELETE", token }),
  
  // Product Verification
  verifyProduct: (data, token) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('file', data.image); // Changed from 'image' to 'file'
    return verificationUploadRequest("/verify-product", { method: "POST", formData, token });
  },
  
  verifyProductBatch: (data, token) => {
    const formData = new FormData();
    data.products.forEach((product, index) => {
      formData.append('titles', product.title);
      formData.append('files', product.image); // Changed from 'images' to 'files'
    });
    return verificationUploadRequest("/verify-product-batch", { method: "POST", formData, token });
  },
  
  // Verify before creation (preview)
  verifyBeforeCreation: (data, token) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.image instanceof File) {
      formData.append('file', data.image); // Changed from 'image' to 'file'
    }
    return verificationUploadRequest("/verify-product", { method: "POST", formData, token });
  },
  
  // Verification health check
  verificationHealth: (token) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${VERIFICATION_API_BASE}/health`, { method: "GET", headers }).then(res => res.json());
  },
};

// Products API - Buyer
export const productsBuyer = {
  listProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    // Get token if available for authenticated features
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    return request(endpoint, { method: "GET", token });
  },
  getProduct: (productSlug) => {
    // Get token if available for authenticated features
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    return request(`/products/${productSlug}`, { method: "GET", token });
  },
  getCategoriesTree: () => request("/products/categories/tree", { method: "GET" }),
  getBrands: () => request("/products/brands/active", { method: "GET" }),
  getActiveBrands: () => request("/products/brands/active", { method: "GET" }),
  
  // Reviews
  createReview: (productId, data, token) => request(`/products/${productId}/reviews`, { method: "POST", body: data, token }),
  getReviews: (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, { method: "GET" });
  },
  getReviewStats: (productId) => request(`/products/${productId}/reviews/stats`, { method: "GET" }),
  updateReview: (reviewId, data, token) => request(`/products/reviews/${reviewId}`, { method: "PUT", body: data, token }),
  deleteReview: (reviewId, token) => request(`/products/reviews/${reviewId}`, { method: "DELETE", token }),
  getMyReviews: (token) => request("/products/reviews/my", { method: "GET", token }),
};

// Product Search API
export const productSearch = {
  // Main search with filters
  search: (searchData) => request("/search/", { method: "POST", body: searchData }),
  
  // Autocomplete and suggestions
  autocomplete: (query, limit = 10) => {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    return request(`/search/autocomplete?${params}`, { method: "GET" });
  },
  
  getSuggestions: (query) => {
    const params = new URLSearchParams({ query });
    return request(`/search/suggestions?${params}`, { method: "GET" });
  },
  
  // Filter options
  getFilterOptions: () => request("/search/filters", { method: "GET" }),
  
  // Advanced filtering
  advancedFilter: (filterData) => request("/search/advanced-filter", { method: "POST", body: filterData }),
  
  // Recommendations
  getRecommendations: (productId = null, type = "similar", limit = 10, token = null) => {
    const params = new URLSearchParams({ 
      recommendation_type: type, 
      limit: limit.toString() 
    });
    if (productId) params.set('product_id', productId);
    return request(`/search/recommendations?${params}`, { method: "GET", token });
  },
  
  // Trending and popular products
  getTrending: (limit = 10) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return request(`/search/trending?${params}`, { method: "GET" });
  },
  
  getTrendingAdvanced: (category = null, timeframe = "week", limit = 10) => {
    const params = new URLSearchParams({ timeframe, limit: limit.toString() });
    if (category) params.set('category', category);
    return request(`/search/trending-advanced?${params}`, { method: "GET" });
  },
  
  getTopRated: (limit = 10) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return request(`/search/top-rated?${params}`, { method: "GET" });
  },
  
  // Product collections
  getNewArrivals: (category = null, days = 30, limit = 10) => {
    const params = new URLSearchParams({ days: days.toString(), limit: limit.toString() });
    if (category) params.set('category', category);
    return request(`/search/new-arrivals?${params}`, { method: "GET" });
  },
  
  getBestSellers: (category = null, timeframe = "month", limit = 10) => {
    const params = new URLSearchParams({ timeframe, limit: limit.toString() });
    if (category) params.set('category', category);
    return request(`/search/best-sellers?${params}`, { method: "GET" });
  },
  
  getSeasonal: (season = null, category = null, limit = 10) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (season) params.set('season', season);
    if (category) params.set('category', category);
    return request(`/search/seasonal?${params}`, { method: "GET" });
  },
  
  // Product relationships
  getCrossSell: (productId, limit = 5) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return request(`/search/cross-sell/${productId}?${params}`, { method: "GET" });
  },
  
  getUpsell: (productId, limit = 5) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return request(`/search/upsell/${productId}?${params}`, { method: "GET" });
  },
  
  // Personalized recommendations
  getPersonalized: (limit = 10, token = null) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return request(`/search/personalized?${params}`, { method: "GET", token });
  },
  
  // Product comparison
  compareProducts: (productIds) => {
    return request("/search/compare", { method: "POST", body: { product_ids: productIds } });
  },
  
  // Price and stock
  getPriceHistory: (productId, days = 30) => {
    const params = new URLSearchParams({ days: days.toString() });
    return request(`/search/price-history/${productId}?${params}`, { method: "GET" });
  },
  
  createStockAlert: (productId, threshold, token) => {
    return request("/search/stock-alerts", { 
      method: "POST", 
      body: { product_id: productId, threshold }, 
      token 
    });
  },
  
  // Bulk operations
  bulkSearch: (queries) => {
    return request("/search/bulk-search", { method: "POST", body: { queries } });
  },
  
  // Analytics
  getSearchAnalytics: (timeframe = "week", token = null) => {
    const params = new URLSearchParams({ timeframe });
    return request(`/search/analytics?${params}`, { method: "GET", token });
  }
};

export const tokens = {
  set: (toks) => {
    try {
      localStorage.setItem("ae_tokens", JSON.stringify(toks));
      try {
        // Notify listeners in this window that tokens changed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ae_tokens_changed', { detail: toks }));
        }
      } catch (e) {}
    } catch {}
  },
  get: () => {
    try {
      const raw = localStorage.getItem("ae_tokens");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear: () => {
    try {
      localStorage.removeItem("ae_tokens");
      try {
        // Notify listeners that tokens were cleared
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ae_tokens_changed', { detail: null }));
        }
      } catch (e) {}
    } catch {}
  },
};

// Buyer Orders API - Complete buyer workflow
export const buyerOrders = {
  // CART MANAGEMENT
  getCart: (sessionId = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    const endpoint = sessionId ? `/buyer/orders/cart?session_id=${sessionId}` : "/buyer/orders/cart";
    return request(endpoint, { method: "GET", token });
  },
  
  addToCart: (productId, quantity, variantId = null, sessionId = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    const body = { product_id: productId, quantity, variant_id: variantId };
    const endpoint = sessionId ? `/buyer/orders/cart/items?session_id=${sessionId}` : "/buyer/orders/cart/items";
    return request(endpoint, { method: "POST", body, token });
  },
  
  updateCartItem: (cartItemId, quantity) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    return request(`/buyer/orders/cart/items/${cartItemId}`, { 
      method: "PUT", 
      body: { quantity }, 
      token 
    });
  },
  
  removeCartItem: (cartItemId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    return request(`/buyer/orders/cart/items/${cartItemId}`, { method: "DELETE", token });
  },
  
  clearCart: (sessionId = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    const endpoint = sessionId ? `/buyer/orders/cart/clear?session_id=${sessionId}` : "/buyer/orders/cart/clear";
    return request(endpoint, { method: "DELETE", token });
  },
  
  transferCart: (sessionId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    return request("/buyer/orders/cart/transfer", { 
      method: "POST", 
      body: { session_id: sessionId }, 
      token 
    });
  },
  
  getCartCount: (sessionId = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    const endpoint = sessionId ? `/buyer/orders/cart/count?session_id=${sessionId}` : "/buyer/orders/cart/count";
    return request(endpoint, { method: "GET", token });
  },
  
  // ORDER MANAGEMENT
  createOrder: (billingAddressId, shippingAddressId, paymentMethod, customerNotes = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for creating orders");
    
    return request("/buyer/orders", { 
      method: "POST", 
      body: { 
        billing_address_id: billingAddressId,
        shipping_address_id: shippingAddressId,
        use_different_shipping: !!shippingAddressId,
        payment_method: paymentMethod,
        customer_notes: customerNotes 
      }, 
      token 
    });
  },
  
  getUserOrders: (page = 1, limit = 20, status = null) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing orders");
    
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.set('status', status);
    return request(`/buyer/orders?${params}`, { method: "GET", token });
  },
  
  getOrderDetails: (orderId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing order details");
    
    return request(`/buyer/orders/${orderId}`, { method: "GET", token });
  },
  
  cancelOrder: (orderId, cancelReason) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for canceling orders");
    
    return request(`/buyer/orders/${orderId}/cancel`, { 
      method: "POST", 
      body: { cancel_reason: cancelReason }, 
      token 
    });
  },
  
  // PAYMENT MANAGEMENT
  getOrderPayments: (orderId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing payments");
    
    return request(`/buyer/orders/${orderId}/payments`, { method: "GET", token });
  },
  
  getUserPayments: (page = 1, limit = 20) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing payments");
    
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return request(`/buyer/orders/payments/?${params}`, { method: "GET", token });
  },
  
  // RETURNS MANAGEMENT
  createReturn: (orderItemId, reason, description, quantity, images = []) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for creating returns");
    
    return request("/buyer/orders/returns", { 
      method: "POST", 
      body: { 
        order_item_id: orderItemId, 
        reason, 
        description, 
        quantity, 
        images 
      }, 
      token 
    });
  },
  
  getUserReturns: (page = 1, limit = 20) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing returns");
    
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return request(`/buyer/orders/returns/?${params}`, { method: "GET", token });
  },
  
  getReturnDetails: (returnId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for viewing return details");
    
    return request(`/buyer/orders/returns/${returnId}`, { method: "GET", token });
  },
  
  // ORDER TRACKING
  trackOrder: (orderId) => {
    const userTokens = tokens.get();
    const token = userTokens?.access_token;
    if (!token) throw new Error("Authentication required for tracking orders");
    
    return request(`/buyer/orders/${orderId}/track`, { method: "GET", token });
  }
};

// Export uploadRequest function for use in services
export { uploadRequest };

export default { auth, supplierOnboarding, productsSupplier, productsBuyer, productSearch, buyerOrders, tokens };
