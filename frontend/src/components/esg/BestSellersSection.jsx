import ProductCard from '../ui/ProductCard';

export default function BestSellersSection() {
  // Best seller products data
  const bestSellerProducts = [
    {
      imageUrl: "/hotdeals.png",
      category: "Home & Kitchen", 
      title: "Jute Bag | Originally Sourced",
      description: "Sustainable jute bag for daily use",
      price: 89,
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      variant: "default",
      size: "default"
    },
    {
      imageUrl: "/hotdeals.png",
      category: "Personal Care",
      title: "Eco Bamboo Water Bottle",
      description: "BPA-free bamboo water bottle",
      price: 65,
      originalPrice: 85,
      rating: 4.8,
      reviews: 342,
      variant: "default",
      size: "default"
    },
    {
      imageUrl: "/hotdeals.png",
      category: "Fashion",
      title: "Organic Cotton T-Shirt",
      description: "100% organic cotton sustainable tee",
      price: 125,
      originalPrice: 160,
      rating: 4.7,
      reviews: 289,
      variant: "default",
      size: "default"
    },
    {
      imageUrl: "/hotdeals.png",
      category: "Stationery",
      title: "Recycled Paper Diary",
      description: "Eco-friendly recycled paper diary",
      price: 45,
      originalPrice: 65,
      rating: 4.9,
      reviews: 201,
      variant: "default",
      size: "default"
    },
    {
      imageUrl: "/hotdeals.png",
      category: "Accessories",
      title: "Hemp Fiber Backpack",
      description: "Durable hemp fiber travel backpack",
      price: 180,
      originalPrice: 240,
      rating: 4.8,
      reviews: 156,
      variant: "default",
      size: "default"
    }
  ];

  return (
    <section className="w-full py-8 sm:py-[55px]" style={{ background: '#f8f7f8' }}>
      <div className="flex flex-col gap-6 sm:gap-[38px] items-center justify-start w-full max-w-[1341px] mx-auto px-4">
        
        {/* Section Title */}
        <h2 className="font-reem text-[#1a1a1a] text-2xl sm:text-3xl lg:text-[35.857px] text-center leading-[1.2] w-full">
          Best Sellers
        </h2>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 items-start justify-center w-full">
          {bestSellerProducts.map((product, index) => (
            <ProductCard 
              key={index}
              productId={null} // Demo products don't have real IDs
              {...product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
