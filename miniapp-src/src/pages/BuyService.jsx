import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useTelegram } from '../contexts/TelegramContext'

const BuyService = () => {
  const navigate = useNavigate()
  const { getCategories, getProducts, buyService, getUserInfo } = useApi()
  const { hapticFeedback, showAlert, showConfirm } = useTelegram()
  
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const durations = [
    { value: 30, label: '۱ ماهه' },
    { value: 90, label: '۳ ماهه' },
    { value: 180, label: '۶ ماهه' },
    { value: 365, label: '۱ ساله' },
  ]

  useEffect(() => {
    loadCategories()
    loadUserInfo()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data.categories || [])
    } catch (error) {
      showAlert('خطا در دریافت دسته‌بندی‌ها')
    } finally {
      setLoading(false)
    }
  }

  const loadUserInfo = async () => {
    try {
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  const loadProducts = async (categoryId, days) => {
    try {
      setLoading(true)
      const data = await getProducts(categoryId)
      const filtered = data.products?.filter(p => p.days === days) || []
      setProducts(filtered)
    } catch (error) {
      showAlert('خطا در دریافت محصولات')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    hapticFeedback('light')
    setStep(2)
  }

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration)
    hapticFeedback('light')
    loadProducts(selectedCategory.id, duration.value)
    setStep(3)
  }

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    hapticFeedback('light')
    setStep(4)
  }

  const handlePurchase = () => {
    if (!selectedProduct) return

    const walletBalance = userInfo?.wallet_balance || 0
    const productPrice = selectedProduct.price

    if (walletBalance < productPrice) {
      showAlert(`موجودی کافی نیست. موجودی شما: ${walletBalance.toLocaleString('fa-IR')} تومان`)
      return
    }

    showConfirm(
      `آیا مایل به خرید ${selectedProduct.title} به مبلغ ${productPrice.toLocaleString('fa-IR')} تومان هستید؟`,
      (confirmed) => {
        if (confirmed) {
          processPurchase()
        }
      }
    )
  }

  const processPurchase = async () => {
    try {
      setPurchasing(true)
      hapticFeedback('medium')
      
      const data = await buyService(selectedProduct.id, 1)
      
      if (data.success) {
        hapticFeedback('success')
        showAlert('خرید با موفقیت انجام شد!')
        navigate('/services')
      } else {
        showAlert(data.message || 'خطا در خرید سرویس')
      }
    } catch (error) {
      showAlert('خطا در خرید سرویس')
    } finally {
      setPurchasing(false)
    }
  }

  const handleBack = () => {
    hapticFeedback('light')
    if (step > 1) {
      setStep(step - 1)
      if (step === 2) setSelectedCategory(null)
      if (step === 3) setSelectedDuration(null)
      if (step === 4) setSelectedProduct(null)
    } else {
      navigate('/')
    }
  }

  const steps = [
    { number: 1, title: 'انتخاب دسته' },
    { number: 2, title: 'مدت زمان' },
    { number: 3, title: 'انتخاب سرویس' },
    { number: 4, title: 'پرداخت' },
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">خرید سرویس جدید</h1>
        <p className="text-gray-400">مراحل خرید را دنبال کنید</p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.number
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {step > s.number ? <Check size={20} /> : s.number}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    step >= s.number ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-all ${
                    step > s.number ? 'bg-primary-500' : 'bg-white/10'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Wallet Balance */}
      {userInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-gray-400 mb-1">موجودی کیف پول</p>
          <p className="text-2xl font-bold text-primary-400">
            {userInfo.wallet_balance?.toLocaleString('fa-IR')} تومان
          </p>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {/* Step 1: Categories */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">دسته‌بندی را انتخاب کنید</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleCategorySelect(category)}
                    className="glass-card-hover p-6 text-center space-y-3"
                  >
                    <div className="text-4xl">{category.icon || '📦'}</div>
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Duration */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">مدت زمان سرویس را انتخاب کنید</h2>
            <div className="grid grid-cols-2 gap-4">
              {durations.map((duration) => (
                <motion.button
                  key={duration.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleDurationSelect(duration)}
                  className="glass-card-hover p-6 text-center space-y-2"
                >
                  <div className="text-3xl font-bold text-primary-400">
                    {duration.value}
                  </div>
                  <p className="text-gray-400">روز</p>
                  <p className="font-bold">{duration.label}</p>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Products */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">سرویس مورد نظر را انتخاب کنید</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-400">محصولی برای این دسته یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleProductSelect(product)}
                    className="w-full glass-card-hover p-5 text-right"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      <span className="badge-info">{product.volume} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>🕒 {product.days} روز</p>
                        <p>📊 {product.volume} گیگابایت</p>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-primary-400">
                          {product.price?.toLocaleString('fa-IR')}
                        </p>
                        <p className="text-gray-400 text-sm">تومان</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 4: Payment */}
        {step === 4 && selectedProduct && (
          <>
            <h2 className="text-xl font-bold">تایید و پرداخت</h2>
            <div className="glass-card p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">دسته‌بندی:</span>
                  <span className="font-bold">{selectedCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">محصول:</span>
                  <span className="font-bold">{selectedProduct.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">حجم:</span>
                  <span className="font-bold">{selectedProduct.volume} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">مدت زمان:</span>
                  <span className="font-bold">{selectedProduct.days} روز</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">قیمت:</span>
                    <span className="text-2xl font-bold text-primary-400">
                      {selectedProduct.price?.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? 'در حال پردازش...' : 'تایید و پرداخت'}
            </button>
          </>
        )}
      </motion.div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <ChevronLeft size={20} />
        بازگشت
      </button>
    </div>
  )
}

export default BuyService
