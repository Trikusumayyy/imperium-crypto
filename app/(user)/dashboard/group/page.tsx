'use client'
import { MessageSquare, ExternalLink, Lock } from 'lucide-react'

export default function GroupPage() {
  const isVip = false; // Nanti hubungkan ke status user real

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-20 h-20 bg-[#5865F2]/10 rounded-3xl flex items-center justify-center text-[#5865F2] mb-6 border border-[#5865F2]/20">
        <MessageSquare size={40} />
      </div>
      <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Komunitas Imperium</h1>
      <p className="text-neutral-500 text-sm mt-2 max-w-xs">Pilih grup diskusi sesuai tingkat membership kamu.</p>

      <div className="w-full mt-10 space-y-4">
        {/* Link Free */}
        <a href="LINK_DISCORD_FREE" className=" p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex justify-between items-center group">
          <div className="text-left">
            <div className="text-white font-bold">Public Group</div>
            <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Akses Gratis</div>
          </div>
          <ExternalLink size={18} className="text-neutral-600 group-hover:text-white transition-all" />
        </a>

        {/* Link VIP */}
        <div className={`p-5 rounded-2xl border flex justify-between items-center ${isVip ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-black/50 border-neutral-900 opacity-50'}`}>
          <div className="text-left">
            <div className={`font-bold ${isVip ? 'text-yellow-500' : 'text-neutral-500'}`}>VIP Inner Circle</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Sinyal & Edukasi</div>
          </div>
          {isVip ? <ExternalLink size={18} /> : <Lock size={18} />}
        </div>
      </div>
    </div>
  )
}