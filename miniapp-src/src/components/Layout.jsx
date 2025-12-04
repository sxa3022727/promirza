import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

const Layout = ({ children }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <BottomNav />
    </div>
  )
}

export default Layout
