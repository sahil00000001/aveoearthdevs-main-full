import Link from "next/link";
import Image from "next/image";

export default function CategoryCard({ title, imageUrl, href = "#" }) {
  return (
    <Link href={href} className="bg-[#7e7e7e] flex flex-col items-start justify-start overflow-hidden relative rounded-[12px] w-full sm:w-[240px] lg:w-[253px] cursor-pointer hover:transform hover:scale-105 transition-all duration-300 group">
      
      {/* Category Image */}
      <div className="relative w-full h-[140px] sm:h-[150px] lg:h-[164px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover object-center transition-all duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />
      </div>
      
      {/* Category Title */}
      <div className="box-border flex flex-col gap-4 items-start justify-start px-4 sm:px-6 py-3 relative w-full">
        <div className="flex flex-col gap-1 items-start justify-start relative w-full">
          <div className="flex flex-col font-reem font-semibold justify-center leading-[0] relative text-[16px] sm:text-[18px] lg:text-[20px] text-center text-white w-full">
            <p className="leading-normal">{title}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
