import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/currency'
import { toast } from 'react-toastify'
import LazyImage from '../components/LazyImage'

const Cart = () => {
  const navigate = useNavigate()
  const { items, loading, updateCartItem, removeFromCart, getCartTotal, getCartCount } = useCart()
  const { isAuthenticated } = useAuth()
  const [updatingItems, setUpdatingItems] = useState(new Set())

  // Handle quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => new Set(prev).add(productId))

    try {
      await updateCartItem(productId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(productId)
      } catch (error) {
        console.error('Error removing item:', error)
        toast.error('Failed to remove item')
      }
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    navigate('/checkout')
  }

  // Case: Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login to View Cart</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to access your shopping cart</p>
          <Link to="/login" className="btn-primary">
            Login Now
          </Link>
        </div>
      </div>
    )
  }

  // Case: Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-20 w-20 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-3/4 mb-2"></div>
                      <div className="skeleton h-3 w-1/2 mb-4"></div>
                      <div className="skeleton h-4 w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-full mb-4"></div>
                <div className="skeleton h-12 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Case: Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet</p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Case: Cart with items
  const cartTotal = getCartTotal()
  const cartCount = getCartCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart ({cartCount} items)
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item?.product?._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-lg shadow-md p-6 mb-4"
                >
                  <div className="flex items-center space-x-4">
                    <Link to={`/product/${item?.product?._id}`}>
                      <LazyImage
                        src={item?.product?.images[0]}
                        alt={item?.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/product/${item?.product?._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {item?.product?.name}
                      </Link>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {item?.product?.description}
                      </p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(item?.product?.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item?.product?._id, item?.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item?.product?._id)}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 font-semibold min-w-[60px] text-center">
                          {updatingItems.has(item?.product?._id) ? '...' : item?.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item?.product._id, item?.quantity + 1)}
                          disabled={item.quantity >= item?.product?.stock || updatingItems.has(item?.product?._id)}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item?.product?._id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Item Total ({item?.quantity} × {formatPrice(item?.product?.price)})
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item?.product?.price * item?.quantity)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {cartTotal >= 999 ? 'Free' : formatPrice(99)}
                  </span>
                </div>
                {cartTotal < 999 && (
                  <div className="text-sm text-gray-500">
                    Add {formatPrice(999 - cartTotal)} more for free shipping
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(cartTotal >= 999 ? cartTotal : cartTotal + 99)}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full btn-primary text-lg py-3"
              >
                Proceed to Checkout
              </motion.button>

              <div className="mt-4 text-center">
                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
