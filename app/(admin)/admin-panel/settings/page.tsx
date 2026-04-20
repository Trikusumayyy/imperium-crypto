'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail, RefreshCw 
} from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    async function getAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setAdminEmail(user.email)
      setLoading(false)
    }
    getAdmin()
  }, [])

  const handleLogout = async () => {
    if (!confirm('Keluar dari Admin Panel?')) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleResetPassword = async () => {
    if (!adminEmail) return
    const confirmReset = confirm(`Kirim link ganti password ke ${adminEmail}?`)
    if (!confirmReset) return
    const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
      redirectTo: `${window.location.origin}/admin-panel/settings`,
    })
    if (error) alert(error.message)
    else alert('Link reset password sudah dikirim ke email!')
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left text-xs md:text-sm">
      
      {/* Profile Header */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-4">
        <div className="h-14 w-14 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-xl uppercase leading-none">
          {adminEmail ? adminEmail.substring(0, 2) : 'AD'}
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-tight text-white leading-none">Super Admin</h2>
          <p className="text-xs text-neutral-500 font-bold uppercase mt-2 tracking-tight">{adminEmail || 'admin@imperium.com'}</p>
        </div>
      </div>

      {/* Keamanan Admin */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Keamanan Admin</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
          <SettingItem icon={<Mail size={16}/>} title="Email Utama" value={adminEmail} />
          <div onClick={handleResetPassword} className="cursor-pointer">
            <SettingItem icon={<Lock size={16}/>} title="Update Password" value="Amankan akun secara berkala" isLink />
          </div>
          <SettingItem icon={<Smartphone size={16}/>} title="Device Terdaftar" value="1 Perangkat Aktif" />
        </div>
      </div>

      {/* Konfigurasi Sistem */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Konfigurasi Sistem</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
          {/* DISINI PERBAIKANNYA: dbField harus diisi sesuai kolom di tabel SQL lu */}
          <ToggleItem 
            icon={<Bell size={16}/>} 
            title="Notifikasi Email" 
            desc="Kirim notif ke email setiap ada transfer" 
            dbField="email_notif_active" 
          />
          <ToggleItem 
            icon={<Globe size={16}/>} 
            title="Maintenance Mode" 
            desc="Tutup akses website sementara" 
            dbField="maintenance_mode" 
          />
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button 
          onClick={handleLogout} 
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut size={18} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}

function SettingItem({ icon, title, value, isLink }: { icon: ReactNode, title: string, value: string, isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-800/40 transition-all">
      <div className="flex items-center gap-4">
        <div className="text-yellow-500">{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase text-white">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight">{value}</p>
        </div>
      </div>
      {isLink && <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Edit</span>}
    </div>
  )
}

function ToggleItem({ icon, title, desc, dbField }: { icon: ReactNode, title: string, desc: string, dbField: string }) {
  const [active, setActive] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Load status awal
  useEffect(() => {
    const getSetting = async () => {
      const { data } = await (supabase.from('admin_settings') as unknown as { select: (field: string) => { eq: (col: string, val: number) => { single: () => Promise<{ data: Record<string, boolean> | null }> } } }).select(dbField).eq('id', 1).single()
      if (data) setActive(data[dbField])
    }
    getSetting()
  }, [dbField])

  const handleToggle = async () => {
    const newState = !active
    setActive(newState) // Optimistic UI
    setSyncing(true)
    
    const { error } = await (supabase.from('admin_settings') as unknown as { update: (obj: Record<string, boolean>) => { eq: (col: string, val: number) => Promise<{ error: Error | null }> } })
      .update({ [dbField]: newState })
      .eq('id', 1)

    if (error) {
      alert("Gagal update setting di database!")
      setActive(!newState) // Rollback UI kalau error
    }
    setSyncing(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-left">
        <div className={syncing ? "text-neutral-500 animate-pulse" : "text-yellow-500"}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-white leading-none">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-tight leading-none">{desc}</p>
        </div>
      </div>
      <button 
        onClick={handleToggle} 
        disabled={syncing}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'} ${syncing ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}