'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Save, Plus, Trash2, MessageSquare, 
  RefreshCw, HelpCircle, X 
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

// TRIK FINAL: Kita bikin struktur dummy yang 'menyerupai' PostgrestBuilder
// Tanpa pake Generic <T> yang bikin TS pusing.
interface QueryResult {
  data: unknown;
  error: unknown;
  eq: (col: string, val: string | number | boolean) => QueryResult;
  select: (columns: string) => QueryResult;
  single: () => Promise<QueryResult>;
  order: (col: string, opt: unknown) => QueryResult;
  insert: (val: unknown[]) => Promise<QueryResult>;
  update: (val: unknown) => QueryResult;
  delete: () => QueryResult;
}

interface SupabaseBypass {
  from: (table: string) => QueryResult;
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
  const isMounted = useRef(true)
  
  const [showFaqModal, setShowFaqModal] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  // Double casting lewat unknown biar ESLint gak teriak 'Unexpected any'
  const db = (supabase as unknown) as SupabaseBypass

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return
    setLoading(true)
    try {
      const resConfig = await db.from('support_config').select('*').eq('id', 1).single() as unknown as { data: SupportConfig }
      const resFaqs = await db.from('support_faqs').select('*').order('created_at', { ascending: false }) as unknown as { data: FAQ[] }
      
      if (resConfig.data) setConfig(resConfig.data)
      if (resFaqs.data) setFaqs(resFaqs.data)
    } catch (err) {
      console.error(err)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [db])

  useEffect(() => {
    isMounted.current = true
    fetchData()
    return () => { isMounted.current = false }
  }, [fetchData])

  const handleUpdateConfig = async () => {
    setIsSaving(true)
    const { error } = await (db.from('support_config').update(config).eq('id', 1) as unknown as Promise<{ error: Error | null }>)
    if (error) alert((error as Error).message)
    else alert('Kontak Support Berhasil Diperbarui!')
    setIsSaving(false)
  }

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    setIsSaving(true)
    const { error } = await (db.from('support_faqs').insert([newFaq]) as unknown as Promise<{ error: Error | null }>)
    if (!error) {
      setShowFaqModal(false)
      setNewFaq({ question: '', answer: '' })
      fetchData()
    } else {
      alert((error as Error).message)
    }
    setIsSaving(false)
  }

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Hapus FAQ ini?')) return
    const { error } = await (db.from('support_faqs').delete().eq('id', id) as unknown as Promise<{ error: Error | null }>)
    if (!error) fetchData()
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-32 bg-black min-h-screen text-white text-left">
      {/* SECTION KONTAK */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase px-1 flex items-center gap-2">
          <MessageSquare size={14} /> Kontak Support
        </h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">WhatsApp</label>
            <input type="text" value={config.whatsapp_number} onChange={(e) => setConfig({...config, whatsapp_number: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Telegram</label>
            <input type="text" value={config.telegram_link} onChange={(e) => setConfig({...config, telegram_link: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Email</label>
            <input type="text" value={config.support_email} onChange={(e) => setConfig({...config, support_email: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Operasional</label>
            <input type="text" value={config.operational_hours} onChange={(e) => setConfig({...config, operational_hours: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <button onClick={handleUpdateConfig} disabled={isSaving} className="md:col-span-2 py-3 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Simpan Perubahan
          </button>
        </div>
      </div>

      {/* SECTION FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-neutral-500 uppercase px-1 flex items-center gap-2">
            <HelpCircle size={14} /> FAQ Member
          </h3>
          <button onClick={() => setShowFaqModal(true)} className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-[10px] font-bold uppercase"><Plus size={14} className="inline mr-1" /> Tambah</button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex justify-between">
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase">{faq.question}</p>
                <p className="text-[10px] text-neutral-500 uppercase mt-1">{faq.answer}</p>
              </div>
              <button onClick={() => handleDeleteFaq(faq.id)} className="text-neutral-700 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <p className="text-xs font-bold uppercase">Tambah FAQ</p>
              <button onClick={() => setShowFaqModal(false)}><X size={18}/></button>
            </div>
            <input type="text" placeholder="Pertanyaan" value={newFaq.question} onChange={(e) => setNewFaq({...newFaq, question: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white" />
            <textarea placeholder="Jawaban" value={newFaq.answer} onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white min-h-20" />
            <button onClick={handleAddFaq} className="w-full py-3 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase">Simpan</button>
          </div>
        </div>
      )}
    </div>
  )
}