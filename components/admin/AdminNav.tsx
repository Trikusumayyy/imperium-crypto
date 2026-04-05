'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Tag, 
  Settings, 
  CreditCard 
} from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()

  const menus = [
    { name: 'Dash', path: '/admin-panel', icon: <LayoutDashboard size={18} /> },
    { name: 'Members', path: '/admin-panel/members', icon: <Users size={18} /> },
    { name: 'Payment', path: '/admin-panel/payments', icon: <CreditCard size={18} /> },
    { name: 'Pricing', path: '/admin-panel/pricing', icon: <Tag size={18} /> },
    { name: 'Settings', path: '/admin-panel/settings', icon: <Settings size={18} /> },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-neutral-900/90 backdrop-blur-xl border-t border-white/5 z-50 md:hidden">
      <ul className="flex items-center justify-around">
        {menus.map((menu) => {
          const isActive = pathname === menu.path
          return (
            <li key={menu.path} className="flex-1">
              <Link 
                href={menu.path}
                className={`flex flex-col items-center justify-center gap-1 py-3 transition-all ${
                  isActive 
                  ? 'text-yellow-500 bg-yellow-500/5' 
                  : 'text-neutral-500'
                }`}
              >
                <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {menu.icon}
                </div>
                <span className="text-xs uppercase font-bold tracking-tighter leading-none">
                  {menu.name}
                </span>
                {/* Indicator Line Aktif */}
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-yellow-500 rounded-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}