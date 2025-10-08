import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react'
import api from '../utils/api'
import { formatPrice, formatPriceWithDecimals } from '../utils/currency'
import { toast } from 'react-toastify'
import LazyImage from '../components/LazyImage'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery'
      case 'upi':
        return 'UPI Payment'
      case 'card':
        return 'Card Payment'
      default:
        return method
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-48 mb-8"></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="skeleton h-5 w-32 mb-2"></div>
                  <div className="skeleton h-4 w-48"></div>
                </div>
                <div className="skeleton h-6 w-20"></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="skeleton h-16 w-16 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8">
              When you place your first order, it will appear here
            </p>
            <Link
              to="/products"
              className="btn-primary"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">
                {orders.length}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPriceWithDecimals(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <LazyImage
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-primary-600">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Payment Method:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`text-sm font-medium capitalize ${
                        order.paymentStatus === 'completed' 
                          ? 'text-green-600' 
                          : order.paymentStatus === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Shipping Address:</h5>
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 btn-secondary text-sm">
                      Track Order
                    </button>
                    {order.orderStatus === 'delivered' && (
                      <button className="flex-1 btn-secondary text-sm">
                        Return/Exchange
                      </button>
                    )}
                    <button className="flex-1 btn-secondary text-sm">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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

export default Orders