import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateProfile, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Debug: Log user data changes
  useEffect(() => {
    console.log('User data updated:', {
      user,
      wishlistCount: user?.wishlist?.length,
      ordersCount: user?.orders?.length
    });
  }, [user]);

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      
      default:
        break;
    }
    
    return newErrors;
  }, [errors]);

  const handleEdit = () => {
    setIsEditing(true);
    setTouched({});
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setErrors({});
    setTouched({});
  };

  const handleSave = async () => {
    // Mark all fields as touched for validation
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      address: true,
    };
    setTouched(allTouched);

    // Validate all fields
    let newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors = validateField(key, formData[key]);
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setTouched({});
      setErrors({});
      
      // Force refresh user data to ensure we have latest counts
      setTimeout(() => {
        refreshUserData();
      }, 100);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched before or we're in editing mode
    if (touched[name] || isEditing) {
      const newErrors = validateField(name, value);
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const newErrors = validateField(name, formData[name]);
    setErrors(newErrors);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200";
    
    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 bg-red-50`;
    }
    
    return `${baseClass} border-gray-300 bg-white`;
  };

  const getDisplayClassName = () => {
    return "flex items-center p-3 bg-gray-50 rounded-lg border border-transparent";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {user.name}
                    </h1>
                    <div className="flex items-center mt-1 text-primary-100">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <motion.button
                        onClick={handleSave}
                        disabled={isLoading || Object.keys(errors).length > 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? 'Saving...' : 'Save'}</span>
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-4 py-2 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName('name')}
                      placeholder="Enter your full name"
                    />
                    {errors.name && touched.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <div className={getDisplayClassName()}>
                    <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-900">{user.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName('email')}
                      placeholder="Enter your email address"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className={getDisplayClassName()}>
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClassName('phone')}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className={getDisplayClassName()}>
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-900">
                      {user.phone || "Not provided"}
                    </span>
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                      className={getInputClassName('address')}
                      placeholder="Enter your address"
                    />
                  </div>
                ) : (
                  <div className={getDisplayClassName()}>
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-900">
                      {user.address || "Not provided"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;