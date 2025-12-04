import { useEffect, useState } from 'react'
import { User, Wallet, Package, ShoppingCart, FileText, Users, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useTelegram } from '../contexts/TelegramContext'

const Account = () => {
  const { getUserInfo } = useApi()
  const { hapticFeedback, user } = useTelegram()
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

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

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      hapticFeedback('success')
      setCopiedId(type)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const stats = [
    {
      icon: Package,
      label: 'سرویس فعال',
      value: userInfo?.active_services || 0,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ShoppingCart,
      label: 'خرید انجام شده',
      value: userInfo?.total_purchases || 0,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      label: 'فاکتورها',
      value: userInfo?.invoices_count || 0,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      label: 'زیرمجموعه',
      value: userInfo?.referrals_count || 0,
      color: 'from-orange-500 to-red-500',
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">حساب کاربری</h1>
        <p className="text-gray-400">مشاهده و مدیریت اطلاعات حساب</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-3xl">
              <User size={40} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {user?.first_name || 'کاربر'} {user?.last_name || ''}
              </h2>
              <p className="text-gray-400">@{user?.username || 'username'}</p>
            </div>
          </div>

          {/* User IDs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 glass-card rounded-xl">
              <div>
                <p className="text-gray-400 text-sm">شناسه تلگرام</p>
                <p className="font-mono font-bold">{user?.id || 'N/A'}</p>
              </div>
              <button
                onClick={() => handleCopy(user?.id?.toString(), 'telegram')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {copiedId === 'telegram' ? (
                  <Check className="text-green-400" size={20} />
                ) : (
                  <Copy className="text-gray-400" size={20} />
                )}
              </button>
            </div>

            {userInfo?.user_id && (
              <div className="flex items-center justify-between p-3 glass-card rounded-xl">
                <div>
                  <p className="text-gray-400 text-sm">شناسه سیستم</p>
                  <p className="font-mono font-bold">{userInfo.user_id}</p>
                </div>
                <button
                  onClick={() => handleCopy(userInfo.user_id.toString(), 'system')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  {copiedId === 'system' ? (
                    <Check className="text-green-400" size={20} />
                  ) : (
                    <Copy className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">موجودی کیف پول</p>
              <p className="text-3xl font-bold">
                {userInfo?.wallet_balance?.toLocaleString('fa-IR') || '0'}
                <span className="text-lg text-gray-400 mr-2">تومان</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="glass-card p-5 text-center space-y-3"
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Info */}
      {userInfo?.created_at && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-gray-400 text-sm">عضو از</p>
          <p className="font-bold mt-1">
            {new Date(userInfo.created_at * 1000).toLocaleDateString('fa-IR')}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default Account
