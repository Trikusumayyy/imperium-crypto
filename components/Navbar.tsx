"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Link menu untuk mempermudah maintenance
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About Us', href: '#about' },
  ];

  return (
    <nav className="bg-[#0a0a0a] border-b border-[#d4af37]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* KIRI: Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Imperium Crypto Logo" 
                width={70} 
                height={45} 
                priority
                className="cursor-pointer object-contain"
              />
            </Link>
          </div>

          {/* TENGAH: Menu (Desktop) */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-gray-300 hover:text-[#d4af37] transition-colors font-medium text-sm tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* KANAN: Tombol Gabung/Login (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/login" 
              className="text-[#d4af37] font-medium hover:text-white transition-colors text-sm"
            >
              Login
            </Link>
            <Link 
              href="#pricing" 
              className="bg-[#d4af37] hover:bg-[#b8962e] text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95"
            >
              Gabung Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#d4af37] focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-b border-[#d4af37]/20 pb-6 px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col space-y-4 pt-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-gray-300 py-2 hover:text-[#d4af37]"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-[#d4af37]/10" />
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="text-[#d4af37] py-2"
            >
              Login
            </Link>
            <Link 
              href="#pricing" 
              onClick={() => setIsOpen(false)}
              className="bg-[#d4af37] text-black text-center py-3 rounded-lg font-bold"
            >
              Gabung Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;