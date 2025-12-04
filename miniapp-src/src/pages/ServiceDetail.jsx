import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Copy, ExternalLink, Calendar, TrendingDown, RefreshCw, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useTelegram } from '../contexts/TelegramContext'

const ServiceDetail = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { getServiceDetail, getSubscriptionLink, renewService, getProducts, getUserInfo } = useApi()
  const { hapticFeedback, showAlert, showConfirm } = useTelegram()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [renewing, setRenewing] = useState(false)

  useEffect(() => {
    loadServiceDetail()
    loadUserInfo()
  }, [username])

  const loadServiceDetail = async () => {
    try {
      const data = await getServiceDetail(username)
      setService(data.service)
    } catch (error) {
      showAlert('خطا در دریافت اطلاعات سرویس')
      navigate('/services')
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

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      hapticFeedback('success')
      showAlert('کپی شد!')
    } catch (error) {
      showAlert('خطا در کپی کردن')
    }
  }

  const handleGetLink = async () => {
    try {
      hapticFeedback('medium')
      const data = await getSubscriptionLink(username)
      if (data.success) {
        await handleCopy(data.link)
      } else {
        showAlert('خطا در دریافت لینک')
      }
    } catch (error) {
      showAlert('خطا در دریافت لینک اشتراک')
    }
  }

  const handleRenewClick = async () => {
    try {
      hapticFeedback('medium')
      setShowRenewModal(true)
      const data = await getProducts()
      setProducts(data.products || [])
    } catch (error) {
      showAlert('خطا در دریافت لیست محصولات')
    }
  }

  const handleRenewConfirm = () => {
    if (!selectedProduct) {
      showAlert('لطفا یک محصول را انتخاب کنید')
      return
    }

    const walletBalance = userInfo?.wallet_balance || 0
    const productPrice = selectedProduct.price

    if (walletBalance < productPrice) {
      showAlert(`موجودی کافی نیست. موجودی شما: ${walletBalance.toLocaleString('fa-IR')} تومان`)
      return
    }

    showConfirm(
      `آیا مایل به تمدید سرویس با محصول ${selectedProduct.title} به مبلغ ${productPrice.toLocaleString('fa-IR')} تومان هستید؟`,
      (confirmed) => {
        if (confirmed) {
          processRenewal()
        }
      }
    )
  }

  const processRenewal = async () => {
    try {
      setRenewing(true)
      hapticFeedback('medium')
      
      const data = await renewService(username, selectedProduct.id)
      
      if (data.success) {
        hapticFeedback('success')
        showAlert('سرویس با موفقیت تمدید شد!')
        setShowRenewModal(false)
        loadServiceDetail()
        loadUserInfo()
      } else {
        showAlert(data.message || 'خطا در تمدید سرویس')
      }
    } catch (error) {
      showAlert('خطا در تمدید سرویس')
    } finally {
      setRenewing(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const getDaysLeft = (expireTime) => {
    const now = Date.now() / 1000
    const days = Math.floor((expireTime - now) / 86400)
    return Math.max(days, 0)
  }

  const getTrafficPercent = () => {
    if (!service) return 0
    return Math.min((service.used_traffic / service.total_traffic) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white/70">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return null
  }

  const trafficPercent = getTrafficPercent()

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => {
            hapticFeedback('light')
            navigate('/services')
          }}
          className="p-2 glass-card rounded-xl hover:bg-white/10 transition-all"
        >
          <ArrowRight size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{service.name || service.username}</h1>
          <p className="text-gray-400 text-sm">{service.username}</p>
        </div>
      </motion.div>

      {/* Traffic Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-bold mb-4">میزان مصرف</h2>
        <div className="relative w-48 h-48 mx-auto">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={502.4}
              strokeDashoffset={502.4 - (502.4 * trafficPercent) / 100}
              className="text-primary-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-3xl font-bold">{trafficPercent.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">مصرف شده</p>
          </div>
        </div>
        <div className="text-center mt-4 space-y-1">
          <p className="text-gray-400">
            {formatBytes(service.used_traffic)} از {formatBytes(service.total_traffic)}
          </p>
          <p className="text-primary-400 font-semibold">
            {formatBytes(service.total_traffic - service.used_traffic)} باقیمانده
          </p>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="glass-card p-4 text-center space-y-2">
          <Calendar className="mx-auto text-primary-400" size={28} />
          <p className="text-2xl font-bold">{getDaysLeft(service.expire_time)}</p>
          <p className="text-gray-400 text-sm">روز باقیمانده</p>
        </div>
        <div className="glass-card p-4 text-center space-y-2">
          <TrendingDown className="mx-auto text-primary-400" size={28} />
          <p className="text-2xl font-bold">{formatBytes(service.used_traffic)}</p>
          <p className="text-gray-400 text-sm">مصرف شده</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={handleRenewClick}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          تمدید سرویس
        </button>

        <button
          onClick={handleGetLink}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          <ExternalLink size={20} />
          دریافت لینک اشتراک
        </button>

        <button
          onClick={() => handleCopy(service.username)}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          <Copy size={20} />
          کپی نام کاربری
        </button>
      </motion.div>

      {/* Renew Modal */}
      {showRenewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !renewing && setShowRenewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">انتخاب بسته تمدید</h2>
              <button
                onClick={() => !renewing && setShowRenewModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                disabled={renewing}
              >
                <X size={24} />
              </button>
            </div>

            {userInfo && (
              <div className="mb-4 p-3 glass-card">
                <p className="text-sm text-gray-400">موجودی کیف پول</p>
                <p className="text-xl font-bold text-primary-400">
                  {userInfo.wallet_balance?.toLocaleString('fa-IR')} تومان
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product)
                    hapticFeedback('light')
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 glass-card hover:border-white/30'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {product.volume} GB - {product.days} روز
                    </span>
                    <span className="text-primary-400 font-bold">
                      {product.price?.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRenewConfirm}
              disabled={!selectedProduct || renewing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {renewing ? 'در حال پردازش...' : 'تایید و تمدید'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ServiceDetail
