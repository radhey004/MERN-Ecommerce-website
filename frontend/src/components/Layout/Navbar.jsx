import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load recent searches from memory (not localStorage)
  useEffect(() => {
    setRecentSearches([]);
  }, []);

  // Save recent searches to memory only
  const saveToRecentSearches = useCallback((query) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((item) => item !== query)].slice(
        0,
        5
      );
      return updated;
    });
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced fetch suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/products/suggest?query=${encodeURIComponent(searchQuery)}`
        );
        setSuggestions(res.data || []);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      setIsLoading(false);
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    saveToRecentSearches(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);

    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const product = suggestions[activeIndex];
        saveToRecentSearches(product.name);
        navigate(`/products?search=${encodeURIComponent(product.name)}`);

        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        setIsOpen(false);
      } else if (searchQuery.trim()) {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (product) => {
    // Save to recent searches
    saveToRecentSearches(product.name);

    // Navigate to the search results page
    navigate(`/products?search=${encodeURIComponent(product.name)}`);

    // Clear search input and suggestions
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setIsOpen(false);
  };

  const handleRecentSearchClick = (query) => {
    saveToRecentSearches(query);

    setSearchQuery("");
    setShowSuggestions(false);
    setIsOpen(false);

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const cartCount = getCartCount();

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">E-Cart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${
                location.pathname === "/"
                  ? "text-primary-600 font-semibold"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`transition-colors ${
                location.pathname === "/products"
                  ? "text-primary-600 font-semibold"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Products
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8 relative"
          >
            <div className="relative w-full" ref={suggestionsRef}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

                {isLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto"
                  >
                    {/* Recent Searches */}
                    {!searchQuery && recentSearches.length > 0 && (
                      <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center justify-between px-2 py-1">
                          <div className="flex items-center text-sm font-medium text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            Recent Searches
                          </div>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((query, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleRecentSearchClick(query)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                          >
                            <Clock className="h-4 w-4 mr-3 text-gray-400" />
                            {query}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search Results */}
                    {searchQuery && (
                      <>
                        {suggestions.length > 0 ? (
                          <div className="p-2">
                            <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-500">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Products
                            </div>
                            {suggestions.map((item, index) => (
                              <button
                                key={item._id}
                                type="button"
                                className={`w-full flex items-center px-4 py-2 cursor-pointer text-left ${
                                  index === activeIndex
                                    ? "bg-primary-100 text-primary-700"
                                    : "hover:bg-gray-100"
                                }`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSuggestionClick(item)}
                              >
                                <img
                                  src={
                                    item.images?.[0] || "/placeholder-image.jpg"
                                  }
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover mr-3"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ${item.price} • {item.category}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          !isLoading && (
                            <div className="p-4 text-center text-gray-500">
                              No products found for "{searchQuery}"
                            </div>
                          )
                        )}
                      </>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </Link>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Heart className="h-6 w-6" />
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="px-3 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </form>

                <Link
                  to="/"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>

                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;