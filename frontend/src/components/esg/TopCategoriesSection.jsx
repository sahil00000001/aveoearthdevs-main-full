import CategoryCard from '../ui/CategoryCard';

export default function TopCategoriesSection() {
  // Categories data matching the Figma design
  const categories = [
    {
      title: "Clothes",
      imageUrl: "/category1.png", // Using existing image, replace with actual category images
      href: "/explore?category=fashion"
    },
    {
      title: "Pet Care", 
      imageUrl: "/petcare.jpg", // Replace with actual pet care image
      href: "/explore?category=pets"
    },
    {
      title: "Fitness",
      imageUrl: "/fitness.jpg", // Replace with actual fitness image
      href: "/explore?category=fitness"
    },
    {
      title: "Home & Furniture",
      imageUrl: "/home.jpg", // Replace with actual home & furniture image
      href: "/explore?category=home-living"
    },
    {
      title: "Beauty",
      imageUrl: "/beauty.jpg", // Replace with actual beauty image
      href: "/explore?category=beauty-personal-care"
    }
  ];

  return (
    <section className="w-full py-8 sm:py-16" style={{ background: '#c2bebf' }}>
      <div className="flex flex-col gap-6 sm:gap-[38px] items-center justify-start w-full max-w-[1343px] mx-auto px-4">
        
        {/* Section Title */}
        <h2 className="font-reem font-semibold text-2xl sm:text-3xl lg:text-[35.857px] text-[#52494a] text-center leading-[1.2] w-full">
          Top Categories
        </h2>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 items-center justify-center w-full">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              title={category.title}
              imageUrl={category.imageUrl}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
