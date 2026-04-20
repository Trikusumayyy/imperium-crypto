'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle2, Wallet, 
  ExternalLink, Search, RefreshCw
} from 'lucide-react'

// Definisi Interface untuk Type Safety
interface Payment {
  id: string
  id_user_auth: string
  email_member: string
  nama_paket: string
  harga_bayar: number
  bukti_transfer: string
  status_pembayaran: 'pending' | 'success' | 'failed'
  created_at: string
}

export default function PaymentAdmin() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'pending' | 'success' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    // Berikan tipe data eksplisit pada query select
    const { data, error } = await (supabase.from('data_pembayaran') as unknown as { select: (col: string) => { order: (col: string, opt: unknown) => Promise<{ data: Payment[] | null; error: unknown }> } })
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPayments(data)
    }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleConfirmPayment = async (pay: Payment) => {
    if (!confirm(`Konfirmasi pembayaran dari ${pay.email_member}? User akan otomatis jadi VIP.`)) return
    
    setProcessingId(pay.id)
    try {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 365)

      // 1. Update Status Pembayaran (Cast ke any hanya pada .from untuk bypass schema)
      const { error: payErr } = await (supabase.from('data_pembayaran') as unknown as { update: (obj: Record<string, string>) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } })
        .update({ status_pembayaran: 'success' })
        .eq('id', pay.id)
      if (payErr) throw payErr

      // 2. Update Plan di Profiles
      const { error: profErr } = await (supabase.from('profiles') as unknown as { update: (obj: Record<string, string>) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } })
        .update({ plan: 'vip', plan_status: 'vip' })
        .eq('id', pay.id_user_auth)
      if (profErr) throw profErr

      // 3. Sync ke Data Member VIP
      await (supabase.from('data_member_vip') as unknown as { delete: () => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } }).delete().eq('id_user_auth', pay.id_user_auth)
      
      const { error: vipErr } = await (supabase.from('data_member_vip') as unknown as { insert: (objs: unknown[]) => Promise<{ error: Error | null }> })
        .insert([{
          id_user_auth: pay.id_user_auth,
          email_member: pay.email_member,
          nama_paket: pay.nama_paket,
          harga_bayar: pay.harga_bayar,
          status_aktif: 'aktif',
          tanggal_berakhir: expiryDate.toISOString()
        }])
      if (vipErr) throw vipErr

      alert('Pembayaran Berhasil Dikonfirmasi!')
      fetchPayments()
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Gagal: ${errMsg}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Tolak pembayaran ini?')) return
    const { error } = await (supabase.from('data_pembayaran') as unknown as { update: (obj: Record<string, string>) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } })
      .update({ status_pembayaran: 'failed' })
      .eq('id', id)
    if (!error) fetchPayments()
  }

  const filtered = payments.filter(p => {
    const matchesSearch = p.email_member.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : p.status_pembayaran === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left">
      <div className="flex flex-col md:flex-row gap-4 sticky top-0 z-20 bg-black/80 backdrop-blur-md py-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text" placeholder="Cari Email..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold uppercase outline-none focus:border-yellow-500 transition-all text-white"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {(['pending', 'success', 'all'] as const).map((f) => (
            <button 
              key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? 'bg-yellow-500 text-black' : 'text-neutral-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((pay) => (
          <div key={pay.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4 hover:border-neutral-700 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-800 rounded-xl flex items-center justify-center text-yellow-500 border border-neutral-700">
                  <Wallet size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase text-white truncate max-w-40">{pay.email_member}</p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase mt-0.5 tracking-tight">{pay.nama_paket}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${
                pay.status_pembayaran === 'success' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 
                pay.status_pembayaran === 'failed' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
              }`}>
                {pay.status_pembayaran}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-neutral-800">
              <span className="text-xs font-bold text-white tracking-tight">Rp {pay.harga_bayar.toLocaleString('id-ID')}</span>
              <a href={pay.bukti_transfer} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 uppercase hover:underline">
                Bukti <ExternalLink size={12} />
              </a>
            </div>

            {pay.status_pembayaran === 'pending' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleConfirmPayment(pay)}
                  disabled={processingId === pay.id}
                  className="flex-1 py-3 bg-green-500 text-black rounded-xl text-xs font-bold uppercase hover:bg-green-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === pay.id ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Konfirmasi
                </button>
                <button 
                  onClick={() => handleReject(pay.id)}
                  className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Tolak
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}