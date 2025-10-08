import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Star, ShoppingCart, Zap } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import LazyImage from './LazyImage'
import api from '../utils/api'   

const ProductCard = ({ product }) => {
  const [isWishlist, setIsWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  // ✅ Check if product already in wishlist
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus()
    }
  }, [isAuthenticated, product])

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get('/users/wishlist')
      const wishlistIds = res.data.data.map(item => item._id)
      setIsWishlist(wishlistIds.includes(product._id))
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }

    try {
      setIsLoading(true)
      await addToCart(product._id, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Update wishlist in backend
  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist')
      return
    }

    try {
      if (isWishlist) {
        await api.delete(`/users/wishlist/remove/${product._id}`)
        setIsWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/users/wishlist/add/${product._id}`)
        setIsWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  // Calculate discount percentage
  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {discountPercentage}% OFF
        </div>
      )}
      
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
              isWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Badge Container */}
          <div className="absolute top-12 left-3 flex flex-col gap-1">
            {/* Stock Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Only {product.stock} left
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </div>
            )}

            {product.featured && (
              <div className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Featured
              </div>
            )}
          </div>

          {/* Free Shipping Badge */}
          {product.shipping?.freeShipping && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Free Shipping
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
              {product.name}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 whitespace-nowrap">
              {product.brand}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isLoading
                ? 'bg-primary-400 text-white cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">
              {isLoading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </motion.button>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard