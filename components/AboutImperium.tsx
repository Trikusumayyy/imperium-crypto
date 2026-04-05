import Image from "next/image";

export default function AboutImperium() {
  return (
    <section id="about" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-14 md:grid-cols-2">

          {/* Left: Image */}
<div className="relative -ml-10 w-[110%]">
  <Image
    src="/chart.png"
    alt="Imperium Crypto"
    width={1000}
    height={650}
    className="w-full rounded-2xl object-cover"
  />
</div>


          {/* Right: Content */}
          <div className="max-w-xl">

            <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl">
              Tentang  
              <span className="block text-yellow-400">
                Imperium Crypto
              </span>
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-neutral-400">
              <p>
                Imperium Crypto adalah platform media digital dan edukasi crypto
                yang berfokus pada pengembangan literasi aset digital, analisis
                pasar berbasis data, serta pembentukan mindset finansial modern
                di era ekonomi digital.
              </p>

              <p>
                Platform ini hadir untuk menjembatani kompleksitas dunia crypto
                dengan masyarakat yang ingin memahami aset digital secara
                rasional, objektif, dan bertanggung jawab dalam mengambil
                keputusan.
              </p>

              <p>
                Imperium Crypto beroperasi sebagai media dan platform edukasi,
                bukan sebagai lembaga keuangan dan bukan penyedia nasihat
                investasi personal. Seluruh konten bersifat informatif dan
                mendorong riset mandiri (DYOR).
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
