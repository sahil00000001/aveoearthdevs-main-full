"use client";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white w-full relative overflow-hidden border-t border-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 pt-[45px] pb-0 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12 mb-[45px]">
          
          {/* Company Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Logo */}
            <div className="flex items-center gap-[6px] mb-2">
              <div className="w-[26px] h-[24px] flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="AveoEarth Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-poppins font-medium text-white text-[26px] tracking-[-0.72px] leading-[30px]">
                AveoEarth
              </span>
            </div>
            
            {/* Company Description */}
            <p className="font-poppins text-emerald-100 text-[12px] leading-[1.5] max-w-[280px]">
              The world's largest sustainability-focused marketplace. Connecting eco-conscious consumers with verified sustainable vendors worldwide.
            </p>
          </div>
          
          {/* My Account Column */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="font-poppins font-medium text-white text-[14px] leading-[1.5]">
              My Account
            </h3>
            <div className="flex flex-col gap-[9px]">
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                My Account
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Order History
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Shopping Cart
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Wishlist
              </a>
            </div>
          </div>
          
          {/* Support Column */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="font-poppins font-medium text-white text-[14px] leading-[1.5]">
              Support
            </h3>
            <div className="flex flex-col gap-[9px]">
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Track Order
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Shop
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Product
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Contact
              </a>
            </div>
          </div>
          
          {/* About Us Column */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="font-poppins font-medium text-white text-[14px] leading-[1.5]">
              About Us
            </h3>
            <div className="flex flex-col gap-[9px]">
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Journey so far
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Shop
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Product
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Track Order
              </a>
            </div>
          </div>
          
          {/* Sustainability Column */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="font-poppins font-medium text-white text-[14px] leading-[1.5]">
              Sustainability
            </h3>
            <div className="flex flex-col gap-[9px]">
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                ESG Verification
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Carbon Footprint
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Impact Reports
              </a>
              <a href="#" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Become Vendor
              </a>
              <a href="/reviews/write" className="font-poppins text-emerald-100 text-[12px] leading-[1.5] hover:text-emerald-300 transition-colors cursor-pointer">
                Write a Review
              </a>
            </div>
          </div>
        </div>
        
        {/* Subscribe Row */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-300">Stay updated with product drops and eco-tips</div>
          <form
            className="flex items-center gap-2 w-full md:w-auto"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const emailInput = form.querySelector('input[name="newsletter-email"]');
              const email = emailInput?.value?.trim();
              if (!email) return;
              try {
                const res = await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
                if (res.ok) {
                  emailInput.value = '';
                  alert('Subscribed!');
                } else {
                  alert('Subscription failed');
                }
              } catch {
                alert('Network error');
              }
            }}
          >
            <input name="newsletter-email" type="email" required placeholder="you@example.com" className="px-3 py-2 rounded-md bg-[#0b1220] border border-gray-700 text-gray-100 placeholder:text-gray-400 w-full md:w-72" />
            <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white">Subscribe</button>
          </form>
        </div>

        {/* Footer Bottom - Copyright and Payment Methods */}
        <div className="flex flex-col md:flex-row items-center justify-between py-[18px] border-t border-gray-800 gap-4">
          
          {/* Copyright */}
          <p className="font-poppins text-gray-300 text-[10.5px] leading-[1.5]">
            AveoEarth © 2025. All Rights Reserved
          </p>
          
          {/* Payment Methods */}
          <div className="flex gap-[5px] items-center">
            
            {/* UPI */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <span className="text-[8px] font-bold text-gray-300">UPI</span>
            </div>
            
            {/* Visa */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <span className="text-[8px] font-bold text-gray-300">VISA</span>
            </div>
            
            {/* Mastercard */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <div className="flex">
                <div className="w-2 h-2 bg-[#8b4513] rounded-full"></div>
                <div className="w-2 h-2 bg-[#a0522d] rounded-full -ml-1"></div>
              </div>
            </div>
            
            {/* American Express */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <span className="text-[7px] font-bold text-gray-300">AMEX</span>
            </div>
            
            {/* RuPay */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <span className="text-[7px] font-bold text-gray-300">RuPay</span>
            </div>
            
            {/* Diners Club */}
            <div className="bg-[#0b1220] h-6 w-[35px] rounded-[5px] flex items-center justify-center overflow-hidden border border-gray-700">
              <span className="text-[7px] font-bold text-gray-300">Diners</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
