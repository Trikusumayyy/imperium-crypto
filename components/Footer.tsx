import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Bagian Atas: Brand & Links */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-16">
          <div className="max-w-sm space-y-4">
            <h3 className="text-2xl font-medium tracking-tighter">
              IMPERIUM<span className="text-yellow-500">CRYPTO</span>
            </h3>
            <p className="text-neutral-500  text-sm font-medium   tracking-widest leading-relaxed">
              Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
            {/* Navigasi */}
            <div className="space-y-4">
              <h4 className=" text-sm font-medium text-yellow-500   tracking-widest">Navigasi</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors">Tentang</a></li>
                <li><a href="#pricing" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors">Gabung VIP</a></li>
                <li><a href="#faq" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors">Bantuan</a></li>
              </ul>
            </div>

            {/* Legalitas */}
            <div className="space-y-4">
              <h4 className=" text-sm font-medium text-yellow-500   tracking-widest">Legalitas</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className=" text-sm font-medium text-yellow-500   tracking-widest">Kontak</h4>
              <a href="mailto:support@imperiumcrypto.com" className="text-neutral-400 hover:text-white  text-sm font-medium   transition-colors block">
                support@imperiumcrypto.com
              </a>
            </div>
          </div>
        </div>

        {/* Bagian Tengah: Disclaimer */}
        <div className="py-8 border-t border-neutral-900/50">
          <p className=" text-sm text-neutral-600 font-medium leading-relaxed max-w-4xl   tracking-wider">
            <span className="text-neutral-400 font-medium mr-2  ">Disclaimer:</span> 
            Perdagangan aset crypto memiliki risiko tinggi. Seluruh informasi dalam komunitas ini bersifat edukasi dan referensi, bukan saran finansial mutlak. Akses digital tidak dapat di-refund setelah akses diberikan. Dengan bergabung, Anda menyatakan paham atas risiko investasi Anda sendiri.
          </p>
        </div>

        {/* Bagian Bawah: Copyright */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className=" text-sm font-medium text-neutral-500   tracking-widest">
            &copy; 2026 IMPERIUM CRYPTO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <p className=" text-sm font-medium text-neutral-500   tracking-widest">
              Developed by <a href="https://dicoment.com">Dicoment Agency</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}