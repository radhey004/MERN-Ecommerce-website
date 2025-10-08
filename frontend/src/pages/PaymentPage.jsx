import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { useCart } from '../context/CartContext'

const PaymentPage = ({ orderData, cartTotal, shippingCost, finalTotal, onBack }) => {
  const navigate = useNavigate()
  const { clearCart, items } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState('method')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [upiId, setUpiId] = useState('')
  const [errors, setErrors] = useState({})

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: CreditCard
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay using card (Demo mode)',
      icon: CreditCard
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using UPI (Demo mode)',
      icon: Smartphone
    }
  ]

  const validateCard = () => {
    const newErrors = {}
    
    if (!cardDetails.number.trim()) {
      newErrors.number = 'Card number is required'
    } else if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) {
      newErrors.number = 'Please enter a valid 16-digit card number'
    }
    
    if (!cardDetails.expiry.trim()) {
      newErrors.expiry = 'Expiry date is required'
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter expiry in MM/YY format'
    }
    
    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'CVV is required'
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)'
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.name = 'Cardholder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateUpi = () => {
    const newErrors = {}
    
    if (!upiId.trim()) {
      newErrors.upiId = 'UPI ID is required'
    } else if (!/^[\w.-]+@[\w]+$/.test(upiId)) {
      newErrors.upiId = 'Please enter a valid UPI ID (e.g., name@upi)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19)
    }
    
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
    }
    
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleUpiInputChange = (e) => {
    setUpiId(e.target.value)
    if (errors.upiId) {
      setErrors(prev => ({
        ...prev,
        upiId: ''
      }))
    }
  }

  const placeOrder = async (paymentMethod) => {
    setLoading(true)
    
    try {
      console.log('🛒 Getting cart from backend for user...');
      
      // Only send payment method and shipping address
      // Backend will get cart from database
      const orderDataToSend = {
        paymentMethod: paymentMethod,
        shippingAddress: orderData?.shippingAddress || {}
      }

      console.log('🚀 Sending order data:', JSON.stringify(orderDataToSend, null, 2));

      // Validate required fields
      if (!orderDataToSend.shippingAddress || Object.keys(orderDataToSend.shippingAddress).length === 0) {
        throw new Error('Shipping address is required');
      }

      console.log('📞 Making API call to /orders/create...');
      const response = await api.post('/orders/create', orderDataToSend)
      
      console.log('✅ Order response:', response.data);
      
      toast.success('Order placed successfully!')
      await clearCart()
      
      setPaymentStep('success')
    } catch (error) {
      console.error('❌ Error placing order:', error)
      console.error('🔍 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      error.response.data.error ||
                      `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (method) => {
    if (method === 'cod') {
      await placeOrder('cod')
    } else if (method === 'card') {
      if (validateCard()) {
        // Simulate API call delay for card payment
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
        await placeOrder('card')
      }
    } else if (method === 'upi') {
      if (validateUpi()) {
        // Simulate API call delay for UPI payment
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
        await placeOrder('upi')
      }
    }
  }

  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
    
    if (method === 'cod') {
      setPaymentStep('cod-confirm')
    } else if (method === 'card') {
      setPaymentStep('card')
    } else if (method === 'upi') {
      setPaymentStep('upi')
    }
  }

  const handleCodConfirm = () => {
    processPayment('cod')
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full btn-primary"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full btn-secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Method Selection */}
          {(paymentStep === 'method' || paymentStep === 'card' || paymentStep === 'upi' || paymentStep === 'cod-confirm') && (
            <div className="space-y-6">
              {paymentStep === 'method' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Select Payment Method
                  </h2>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        disabled={loading}
                        className={`w-full flex items-center p-4 border-2 rounded-lg text-left transition-colors ${
                          paymentStep === 'method'
                            ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                            : 'border-gray-200'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <method.icon className="h-6 w-6 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash on Delivery Confirmation */}
              {paymentStep === 'cod-confirm' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Confirm Cash on Delivery
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-800 mb-2">
                        Important Information
                      </h3>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• Pay with cash when your order is delivered</li>
                        <li>• Order will be processed once confirmed</li>
                        <li>• You can track your order status in your account</li>
                      </ul>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setPaymentStep('method')}
                        disabled={loading}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCodConfirm}
                        disabled={loading}
                        className="flex-1 btn-primary"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Placing Order...
                          </div>
                        ) : (
                          `Confirm Order - ${finalTotal}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Payment Form */}
              {paymentStep === 'card' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Card Payment
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`input-field ${errors.number ? 'border-red-300' : ''}`}
                        maxLength={19}
                        disabled={loading}
                      />
                      {errors.number && (
                        <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardInputChange}
                          placeholder="MM/YY"
                          className={`input-field ${errors.expiry ? 'border-red-300' : ''}`}
                          maxLength={5}
                          disabled={loading}
                        />
                        {errors.expiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          placeholder="123"
                          className={`input-field ${errors.cvv ? 'border-red-300' : ''}`}
                          maxLength={4}
                          disabled={loading}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={cardDetails.name}
                        onChange={handleCardInputChange}
                        placeholder="John Doe"
                        className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                        disabled={loading}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setPaymentStep('method')}
                        disabled={loading}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => processPayment('card')}
                        disabled={loading}
                        className="flex-1 btn-primary"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          `Pay ${finalTotal}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentStep === 'upi' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    UPI Payment
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={handleUpiInputChange}
                        placeholder="yourname@upi"
                        className={`input-field ${errors.upiId ? 'border-red-300' : ''}`}
                        disabled={loading}
                      />
                      {errors.upiId && (
                        <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Enter your UPI ID (e.g., name@oksbi, name@paytm)
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setPaymentStep('method')}
                        disabled={loading}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => processPayment('upi')}
                        disabled={loading}
                        className="flex-1 btn-primary"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          `Pay ${finalTotal}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : shippingCost}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {finalTotal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage