'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Save, Plus, Trash2, MessageSquare, Send, Mail, 
  Clock, RefreshCw, HelpCircle, X 
} from 'lucide-react'

interface SupportConfig {
  whatsapp_number: string
  telegram_link: string
  support_email: string
  operational_hours: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}

export default function AdminSupportManager() {
  const [config, setConfig] = useState<SupportConfig>({
    whatsapp_number: '',
    telegram_link: '',
    support_email: '',
    operational_hours: ''
  })
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // State Modal FAQ Baru
  const [showFaqModal, setShowFaqModal] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [resConfig, resFaqs] = await Promise.all([
      (supabase.from('support_config') as any).select('*').eq('id', 1).single(),
      (supabase.from('support_faqs') as any).select('*').order('created_at', { ascending: false })
    ])
    
    if (resConfig.data) setConfig(resConfig.data)
    if (resFaqs.data) setFaqs(resFaqs.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleUpdateConfig = async () => {
    setIsSaving(true)
    const { error } = await (supabase.from('support_config') as any)
      .update(config)
      .eq('id', 1)
    
    if (error) alert(error.message)
    else alert('Kontak Support Berhasil Diperbarui!')
    setIsSaving(false)
  }

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    setIsSaving(true)
    const { error } = await (supabase.from('support_faqs') as any).insert([newFaq])
    
    if (!error) {
      setShowFaqModal(false)
      setNewFaq({ question: '', answer: '' })
      fetchData()
    }
    setIsSaving(false)
  }

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Hapus FAQ ini?')) return
    await (supabase.from('support_faqs') as any).delete().eq('id', id)
    fetchData()
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left">
      
      {/* SECTION 1: KONTAK UTAMA */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <MessageSquare size={14} /> Link Kontak Support
        </h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">WhatsApp (Gunakan 62)</label>
            <input 
              type="text" value={config.whatsapp_number}
              onChange={(e) => setConfig({...config, whatsapp_number: e.target.value})}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Telegram Group Link</label>
            <input 
              type="text" value={config.telegram_link}
              onChange={(e) => setConfig({...config, telegram_link: e.target.value})}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Email Support</label>
            <input 
              type="text" value={config.support_email}
              onChange={(e) => setConfig({...config, support_email: e.target.value})}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Jam Operasional</label>
            <input 
              type="text" value={config.operational_hours}
              onChange={(e) => setConfig({...config, operational_hours: e.target.value})}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <button 
              onClick={handleUpdateConfig}
              disabled={isSaving}
              className="w-full py-3 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Simpan Kontak
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: KELOLA FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <HelpCircle size={14} /> Daftar FAQ Member
          </h3>
          <button 
            onClick={() => setShowFaqModal(true)}
            className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20"
          >
            <Plus size={14} /> Tambah FAQ
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex justify-between items-start gap-4">
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold uppercase text-white">{faq.question}</p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight leading-relaxed">{faq.answer}</p>
              </div>
              <button 
                onClick={() => handleDeleteFaq(faq.id)}
                className="p-2 text-neutral-700 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TAMBAH FAQ */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h3 className="font-bold uppercase text-white text-sm">Tambah FAQ Baru</h3>
              <button onClick={() => setShowFaqModal(false)}><X size={20} className="text-neutral-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Pertanyaan</label>
                <input 
                  type="text" value={newFaq.question}
                  onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
                  placeholder="MISAL: APAKAH BISA REFUND?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Jawaban</label>
                <textarea 
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white min-h-25"
                  placeholder="TULIS JAWABAN DISINI..."
                />
              </div>
              <button 
                onClick={handleAddFaq}
                className="w-full py-4 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                Simpan FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}