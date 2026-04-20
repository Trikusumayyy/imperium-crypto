'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  RefreshCw, 
  Edit3, 
  CheckCircle2, 
  Save, 
  X,
  Package
} from 'lucide-react'

interface PaketVIP {
  id: string
  nama_paket: string
  harga: number
  durasi_hari: number
  fitur: string[] | null
}

export default function PricingEditor() {
  const [plans, setPlans] = useState<PaketVIP[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<PaketVIP | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchPlans = useCallback(async () => {
    // FIX ERROR: Cast tabel ke any di awal panggil
    const { data, error } = await (supabase.from('data_paket_vip') as unknown as { select: (col: string) => { order: (col: string, opt: unknown) => Promise<{ data: PaketVIP[] | null; error: unknown }> } })
      .select('*')
      .order('harga', { ascending: true })
    
    if (!error && data) return data
    return []
  }, [])

  useEffect(() => { 
    const load = async () => {
      setLoading(true)
      const data = await fetchPlans()
      setPlans(data)
      setLoading(false)
    }
    load()
  }, [fetchPlans])

  const handleUpdate = async () => {
    if (!editModal) return
    setSaving(true)
    
    // FIX ERROR: Cast tabel ke any untuk bypass error 'never' pada update
    const { error } = await (supabase.from('data_paket_vip') as unknown as { update: (obj: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } })
      .update({
        nama_paket: editModal.nama_paket,
        harga: editModal.harga,
        durasi_hari: editModal.durasi_hari,
        fitur: editModal.fitur
      })
      .eq('id', editModal.id)
    
    if (!error) {
      setEditModal(null)
      const data = await fetchPlans()
      setPlans(data)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-black min-h-screen text-white">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                <Package size={20} />
              </div>
              <button 
                onClick={() => setEditModal(plan)}
                className="p-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-yellow-500 border border-neutral-700 transition-all"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <h3 className="text-lg font-bold uppercase tracking-tight">{plan.nama_paket}</h3>
            <p className="text-xl font-bold text-yellow-500 mt-1 uppercase tracking-tight">
              Rp {plan.harga.toLocaleString('id-ID')} <span className="text-xs text-neutral-500 font-medium">/ {plan.durasi_hari} HARI</span>
            </p>

            <div className="mt-6 space-y-3">
              {plan.fitur && plan.fitur.length > 0 ? plan.fitur.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase">
                  <CheckCircle2 size={14} className="text-yellow-500" /> {feat}
                </div>
              )) : (
                <p className="text-xs text-neutral-600 uppercase font-medium">Belum ada fitur</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-left animate-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Edit Pricing Plan</h3>
              <button onClick={() => setEditModal(null)} className="text-neutral-500 hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nama Paket</label>
                <input 
                  type="text" 
                  value={editModal.nama_paket} 
                  onChange={e => setEditModal({...editModal, nama_paket: e.target.value})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={editModal.harga} 
                    onChange={e => setEditModal({...editModal, harga: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Durasi (Hari)</label>
                  <input 
                    type="number" 
                    value={editModal.durasi_hari} 
                    onChange={e => setEditModal({...editModal, durasi_hari: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fitur (Pisahkan dengan koma)</label>
                <textarea 
                  rows={3}
                  value={editModal.fitur?.join(', ') || ''} 
                  onChange={e => setEditModal({...editModal, fitur: e.target.value.split(',').map(f => f.trim())})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500"
                  placeholder="CONTOH: SINYAL VIP, MENTORSHIP"
                />
              </div>

              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}