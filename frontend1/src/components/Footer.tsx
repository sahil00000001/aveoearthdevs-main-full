import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Leaf,
} from "lucide-react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-primary-foreground border-t border-border/20">
      {/* Top */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-moss rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-headline font-bold">AveoEarth</div>
                <div className="text-xs text-muted-foreground">Sustainable Marketplace</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover eco-friendly products from responsible brands. Shop consciously,
              live beautifully.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-moss mb-4">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="hover:text-moss transition-colors" to="/category">Categories</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/products">All Products</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/community">Community</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/wishlist">Wishlist</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/cart">Cart</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-moss mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="hover:text-moss transition-colors" to="/about">About Us</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/contact">Contact</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/terms">Terms</Link>
              </li>
              <li>
                <Link className="hover:text-moss transition-colors" to="/privacy">Privacy</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-moss mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our newsletter for eco-tips and product drops.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-background/60 border border-border/30 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-moss text-white hover:opacity-90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-border/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">We Accept:</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
              {/* UPI */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <span className="text-sm font-semibold text-blue-400">UPI</span>
              </div>
              
              {/* Visa */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-sm"></div>
                  <span className="text-sm font-semibold text-blue-400">VISA</span>
                </div>
              </div>
              
              {/* Mastercard */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-red-400">Mastercard</span>
                </div>
              </div>
              
              {/* American Express */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <span className="text-sm font-semibold text-blue-400">AMEX</span>
              </div>
              
              {/* RuPay */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <span className="text-sm font-semibold text-green-400">RuPay</span>
              </div>
              
              {/* Diners */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/20">
                <span className="text-sm font-semibold text-blue-400">Diners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border/20">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {year} AveoEarth. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-moss transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-moss transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-moss transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-moss transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

