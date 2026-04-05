'use client'

import { RefreshCw } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onRefresh?: () => void; // Dibuat opsional dengan tanda ?
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function AdminHeader({ onRefresh, isLoading, children }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Fungsi refresh default kalau onRefresh gak dikirim
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      window.location.reload() // Refresh halaman global jika di layout
    }
  }

  const getPageData = () => {
    switch (pathname) {
      case '/admin-panel':
        return { title: 'Admin Dashboard', subtitle: 'Statistik & Ringkasan Performa' }
      case '/admin-panel/members':
        return { title: 'Manage Members', subtitle: 'Database Profil Member Imperium Crypto' }
      case '/admin-panel/pricing':
        return { title: 'Pricing Editor', subtitle: 'Kelola Paket VIP & Langganan' }
      case '/admin-panel/settings':
        return { title: 'Admin Settings', subtitle: 'Konfigurasi Sistem & Keamanan' }
      default:
        return { title: 'Admin Panel', subtitle: 'Management Dashboard' }
    }
  }

  const { title, subtitle } = getPageData()

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
              {title.split(' ')[0]} <span className="text-yellow-500">{title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
              {subtitle}
            </p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="p-2.5 bg-neutral-900 border border-neutral-800 text-yellow-500 rounded-xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {children}
      </div>
    </header>
  )
}