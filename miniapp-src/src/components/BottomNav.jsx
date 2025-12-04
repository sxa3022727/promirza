import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, Package, User } from 'lucide-react'
import { useTelegram } from '../contexts/TelegramContext'

const BottomNav = () => {
  const { hapticFeedback } = useTelegram()

  const navItems = [
    { path: '/', icon: Home, label: 'خانه' },
    { path: '/services', icon: Package, label: 'سرویس‌ها' },
    { path: '/buy', icon: ShoppingBag, label: 'خرید' },
    { path: '/account', icon: User, label: 'حساب' },
  ]

  const handleClick = () => {
    hapticFeedback('light')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 rounded-t-3xl">
      <div className="flex justify-around items-center py-3 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={24}
                  className={`transition-transform duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
