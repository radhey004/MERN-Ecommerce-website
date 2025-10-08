import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import LazyImage from '../components/LazyImage'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(new Set())
  
  const { addToCart } = useCart()
  const { updateUserData } = useAuth()

  useEffect(() => {
    fetchWishlist()
  }, [])

  // Add to wishlist - Updated to sync with AuthContext
  const addToWishlist = async (productId) => {
    try {
      const response = await api.post(`/users/wishlist/add/${productId}`)
      
      if (response.data.success) {
        await fetchWishlist()
        
        // Update AuthContext with the user data from backend response
        if (response.data.user) {
          updateUserData(response.data.user)
        }
        
        toast.success("Added to wishlist")
      } else {
        throw new Error(response.data.message || 'Failed to add to wishlist')
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast.error(error.response?.data?.message || "Failed to add to wishlist")
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/users/wishlist')
      if (response.data.success) {
        setWishlistItems(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to load wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error(error.response?.data?.message || 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  // Remove from wishlist - Updated to sync with AuthContext
  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/users/wishlist/remove/${productId}`)
      
      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item._id !== productId))
        
        // Update AuthContext with the user data from backend response
        if (response.data.user) {
          updateUserData(response.data.user)
        }
        
        toast.success('Removed from wishlist')
      } else {
        throw new Error(response.data.message || 'Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist')
    }
  }

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }

    setAddingToCart(prev => new Set(prev).add(product._id))

    try {
      await addToCart(product._id, 1)
      
      
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product._id)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(prev => {
        const next = new Set(prev)
        next.delete(product._id)
        return next
      })
    }
  }

  // Move all items to cart
  const moveAllToCart = async () => {
    const inStockItems = wishlistItems.filter(item => item.stock > 0)
    
    if (inStockItems.length === 0) {
      toast.error('No items in stock to add to cart')
      return
    }

    setAddingToCart(new Set(inStockItems.map(item => item._id)))

    try {
      for (const item of inStockItems) {
        await addToCart(item._id, 1)
      }
      
    } catch (error) {
      console.error('Error adding items to cart:', error)
      toast.error('Failed to add some items to cart')
    } finally {
      setAddingToCart(new Set())
    }
  }

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (wishlistItems.length === 0) return

    try {
      const response = await api.delete('/users/wishlist/clear')
      
      if (response.data.success) {
        setWishlistItems([])
        
        // Update AuthContext with the user data from backend response
        if (response.data.user) {
          updateUserData(response.data.user)
        }
        
        toast.success('Wishlist cleared')
      } else {
        throw new Error(response.data.message || 'Failed to clear wishlist')
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      toast.error(error.response?.data?.message || 'Failed to clear wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-48 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="skeleton h-48 w-full"></div>
                <div className="p-4">
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-3 w-full mb-3"></div>
                  <div className="skeleton h-4 w-16 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="skeleton h-8 w-20"></div>
                    <div className="skeleton h-8 w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Save your favorite products here and never lose track of them
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Discover Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inStockItems = wishlistItems.filter(item => item.stock > 0)
  const outOfStockItems = wishlistItems.filter(item => item.stock === 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header with Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <div className="flex items-center space-x-2 bg-primary-100 px-3 py-1 rounded-full">
                  <Heart className="h-5 w-5 text-primary-600 fill-current" />
                  <span className="text-primary-700 font-semibold">
                    {wishlistItems.length}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                {outOfStockItems.length > 0 && (
                  <span className="text-red-500 ml-1">
                    ({outOfStockItems.length} out of stock)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {inStockItems.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={moveAllToCart}
                  disabled={addingToCart.size > 0}
                  className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart.size > 0 ? 'Adding...' : `Add All to Cart (${inStockItems.length})`}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearWishlist}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </motion.button>
            </div>
          </div>

          {/* Out of Stock Section */}
          {outOfStockItems.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {outOfStockItems.length} item(s) out of stock
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Some items in your wishlist are currently unavailable. They will be automatically removed when you clear them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                >
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-70 z-10 flex items-center justify-center">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </div>
                    </div>
                  )}
                  
                  <Link to={`/product/${product._id}`}>
                    <div className="relative overflow-hidden">
                      <LazyImage
                        src={product.images?.[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          removeFromWishlist(product._id)
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-20"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Stock Badge */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Only {product.stock} left
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(product)
                          }}
                          disabled={addingToCart.has(product._id) || product.stock === 0}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : addingToCart.has(product._id)
                              ? 'bg-primary-400 text-white cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {addingToCart.has(product._id) 
                              ? 'Adding...' 
                              : product.stock === 0 
                              ? 'Out of Stock' 
                              : 'Add'
                            }
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Continue Shopping */}
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Wishlist