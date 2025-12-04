import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Package, ShoppingBag, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useTelegram } from '../contexts/TelegramContext'

const Home = () => {
  const { getUserInfo } = useApi()
  const { hapticFeedback, user } = useTelegram()
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'خرید سرویس',
      icon: ShoppingBag,
      path: '/buy',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'سرویس‌های من',
      icon: Package,
      path: '/services',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'حساب کاربری',
      icon: Wallet,
      path: '/account',
      gradient: 'from-green-500 to-emerald-500',
    },
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
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-l from-primary-400 to-primary-600 bg-clip-text text-transparent">
          سلام {user?.first_name || 'کاربر'} عزیز
        </h1>
        <p className="text-gray-400">به پنل مدیریت سرویس‌های خود خوش آمدید</p>
      </motion.div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">موجودی کیف پول</p>
                <p className="text-2xl font-bold">
                  {userInfo?.wallet_balance?.toLocaleString('fa-IR') || '0'}{' '}
                  <span className="text-lg text-gray-400">تومان</span>
                </p>
              </div>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <Package className="mx-auto mb-2 text-primary-400" size={28} />
          <p className="text-2xl font-bold">{userInfo?.active_services || 0}</p>
          <p className="text-gray-400 text-sm">سرویس فعال</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Zap className="mx-auto mb-2 text-yellow-400" size={28} />
          <p className="text-2xl font-bold">{userInfo?.total_purchases || 0}</p>
          <p className="text-gray-400 text-sm">خرید انجام شده</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-xl font-bold text-white mb-4">دسترسی سریع</h2>
        {quickActions.map((action, index) => (
          <Link
            key={action.path}
            to={action.path}
            onClick={() => hapticFeedback('light')}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass-card-hover p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon size={24} />
                </div>
                <span className="font-semibold text-lg">{action.title}</span>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}

export default Home
