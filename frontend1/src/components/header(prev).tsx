import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  Menu,
  Leaf,
  X
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Categories', href: '#categories' },
    { label: 'New Arrivals', href: '#new' },
    { label: 'Best Sellers', href: '#bestsellers' },
    { label: 'About Us', href: '#community' }
  ];

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-moss rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold text-charcoal">
                  AveoEarth
                </h1>
                
              </div>
            </div>

            {/* Desktop Navigation */}
            {/* =================== CHANGE: ADDED LEFT MARGIN =================== */}
            <nav className="hidden lg:flex items-center space-x-8 ml-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-forest transition-colors duration-200 font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sustainable products..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all duration-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-muted-foreground hover:text-forest"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-muted-foreground hover:text-forest relative"
              >
                <Heart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-clay text-white text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-forest relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-forest text-white text-xs p-0 flex items-center justify-center">
                  2
                </Badge>
              </Button>

              {/* User Account */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-muted-foreground hover:text-forest"
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Become Vendor */}
              <Button className="hidden lg:flex btn-secondary text-sm">
                Become a Partner
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-muted-foreground hover:text-forest"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/20 bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sustainable products..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block py-2 text-muted-foreground hover:text-forest transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                <Button variant="ghost" className="flex-1 justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
                <Button variant="ghost" className="flex-1 justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
              </div>

              <Button className="w-full btn-secondary">
                Become a Vendor
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;