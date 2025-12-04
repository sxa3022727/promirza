import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Package, Clock, TrendingDown, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useTelegram } from '../contexts/TelegramContext'

const Services = () => {
  const { getServices } = useApi()
  const { hapticFeedback } = useTelegram()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadServices()
  }, [filter])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await getServices(filter, search)
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadServices()
  }

  const getStatusBadge = (service) => {
    const now = Date.now() / 1000
    const daysLeft = Math.floor((service.expire_time - now) / 86400)
    
    if (service.status === 0 || daysLeft < 0) {
      return <span className="badge-danger">منقضی شده</span>
    }
    
    if (daysLeft <= 3) {
      return <span className="badge-warning">در حال اتمام</span>
    }
    
    if (service.used_traffic / service.total_traffic > 0.9) {
      return <span className="badge-warning">حجم کم</span>
    }
    
    return <span className="badge-success">فعال</span>
  }

  const getTrafficPercent = (service) => {
    return Math.min((service.used_traffic / service.total_traffic) * 100, 100)
  }

  const getDaysLeft = (expireTime) => {
    const now = Date.now() / 1000
    const days = Math.floor((expireTime - now) / 86400)
    return Math.max(days, 0)
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const filters = [
    { value: 'all', label: 'همه' },
    { value: 'active', label: 'فعال' },
    { value: 'expired', label: 'منقضی' },
    { value: 'low', label: 'در حال اتمام' },
  ]

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">سرویس‌های من</h1>
        <p className="text-gray-400">مدیریت و مشاهده سرویس‌های خریداری شده</p>
      </motion.div>

      {/* Search */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="جستجو بر اساس نام..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pr-12"
        />
      </motion.form>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value)
              hapticFeedback('light')
            }}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
              filter === f.value
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400 text-lg">هیچ سرویسی یافت نشد</p>
          </motion.div>
        ) : (
          services.map((service, index) => (
            <Link
              key={service.id}
              to={`/service/${service.username}`}
              onClick={() => hapticFeedback('light')}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="glass-card-hover p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{service.name || service.username}</h3>
                    <p className="text-gray-400 text-sm font-mono">{service.username}</p>
                  </div>
                  {getStatusBadge(service)}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-primary-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">مصرف شده</p>
                      <p className="font-semibold text-sm">
                        {formatBytes(service.used_traffic)} / {formatBytes(service.total_traffic)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-primary-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">زمان باقیمانده</p>
                      <p className="font-semibold text-sm">{getDaysLeft(service.expire_time)} روز</p>
                    </div>
                  </div>
                </div>

                {/* Traffic Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>حجم مصرفی</span>
                    <span>{getTrafficPercent(service).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getTrafficPercent(service)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Warning */}
                {(getDaysLeft(service.expire_time) <= 3 || getTrafficPercent(service) > 90) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <AlertCircle className="text-yellow-400" size={18} />
                    <p className="text-yellow-400 text-sm">
                      {getDaysLeft(service.expire_time) <= 3
                        ? 'سرویس شما در حال اتمام است'
                        : 'حجم سرویس در حال اتمام است'}
                    </p>
                  </div>
                )}
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default Services
