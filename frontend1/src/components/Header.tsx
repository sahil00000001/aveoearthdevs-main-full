import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import SearchAutocomplete from './SearchAutocomplete';
import logoImage from '@/assets/logo.webp';
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  Leaf,
  TreePine,
  Recycle,
  X,
  LogOut
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const { navigateToSearch } = useSearch();
  const { getTotalItems } = useCart();
  const { data: wishlist } = useWishlist();

  const navItems = [
    { label: 'Categories', href: '/category' },
    { label: 'New Arrivals', href: '/products' },
    { label: 'Best Sellers', href: '/products' },
    { label: 'Community', href: '/community' },
    { label: 'About Us', href: '/about' },
  ];

  const handleSignOut = async () => {
    try {
      console.log('Logout button clicked');
      await signOut();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };


  return (
    <>
      {/* Impact Banner */}
      <div className="bg-forest text-primary-foreground py-2 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-1">
            <TreePine className="w-4 h-4" />
            <span>XXX trees planted this month</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Recycle className="w-4 h-4" />
            <span>XX Tonnes CO₂ offset</span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <Leaf className="w-4 h-4" />
            <span>XX plastic items saved</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto" style={{ paddingLeft: '35px', paddingRight: '40px' }}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="AveoEarth Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold text-charcoal whitespace-nowrap">
                  AveoEarth
                </h1>
                <div className="text-xs text-moss whitespace-nowrap">Sustainable Marketplace</div>
              </div>
            </Link>

            {/* Desktop Navigation - All on one line with space-between */}
            <div className="hidden lg:flex items-center flex-1 justify-between mx-8" style={{ minWidth: 0 }}>
              {/* Navigation Links */}
              <nav className="flex items-center gap-6 flex-shrink-0">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-muted-foreground hover:text-forest transition-colors duration-200 font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Search Bar */}
              <div className="hidden md:flex items-center flex-1 mx-8" style={{ maxWidth: '400px', minWidth: '200px' }}>
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={(query) => navigateToSearch(query)}
                  placeholder="Search sustainable products..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions - Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile Search */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden text-muted-foreground hover:text-forest"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Button asChild variant="ghost" size="sm" className="hidden md:flex text-muted-foreground hover:text-forest relative">
                <Link to="/wishlist">
                  <Heart className="w-5 h-5" />
                  {wishlist && wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-clay text-white text-xs flex items-center justify-center font-semibold animate-pulse">
                      {wishlist.length > 99 ? '99+' : wishlist.length}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-forest relative">
                <Link to="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-forest text-white text-xs flex items-center justify-center font-semibold animate-pulse">
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Account / Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-forest">
                    <Link to="/profile">
                      <User className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-forest"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button asChild variant="ghost" size="sm" className="hidden md:flex text-muted-foreground hover:text-forest">
                  <Link to="/login">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              {/* Become Partner */}
              <Button asChild className="hidden lg:flex btn-secondary text-sm">
                <Link to="/vendor">Become a Partner</Link>
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
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={(query) => {
                      navigateToSearch(query);
                      setIsMobileMenuOpen(false);
                    }}
                    placeholder="Search sustainable products..."
                    className="w-full"
                  />

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block py-2 text-muted-foreground hover:text-forest transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                <Button asChild variant="ghost" className="flex-1 justify-start">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4 mr-2" /> Account
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1 justify-start relative">
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                    {wishlist && wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-clay text-white text-xs flex items-center justify-center font-semibold">
                        {wishlist.length > 9 ? '9+' : wishlist.length}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1 justify-start relative">
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-forest text-white text-xs flex items-center justify-center font-semibold">
                        {getTotalItems() > 9 ? '9+' : getTotalItems()}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>

              <Button asChild className="w-full btn-secondary">
                <Link to="/vendor" onClick={() => setIsMobileMenuOpen(false)}>Become a Partner</Link>
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
