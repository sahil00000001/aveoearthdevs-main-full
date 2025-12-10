import Link from "next/link";

export default function VendorLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">AveoEarth</span>
            <span className="text-sm text-gray-500 ml-2">Vendor Portal</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link href="/vendor/notifications" className="relative p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-800 font-semibold text-sm">V</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Vendor Account</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>

            <div className="relative group">
              <button className="p-1 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/vendor/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile Settings
                  </Link>
                  <Link href="/vendor/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Billing & Payments
                  </Link>
                  <Link href="/vendor/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Help & Support
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-gray-600">© 2025 AveoEarth Vendor Portal</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/vendor/terms" className="hover:text-gray-900">Terms of Service</Link>
              <Link href="/vendor/privacy" className="hover:text-gray-900">Privacy Policy</Link>
              <Link href="/vendor/support" className="hover:text-gray-900">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
