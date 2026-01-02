import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const popularCities = [
    { name: 'İstanbul', slug: 'istanbul' },
    { name: 'Ankara', slug: 'ankara' },
    { name: 'İzmir', slug: 'izmir' },
    { name: 'Bursa', slug: 'bursa' },
    { name: 'Antalya', slug: 'antalya' },
    { name: 'Adana', slug: 'adana' },
  ]

  const popularPositions = [
    { name: 'Garson', slug: 'waiter' },
    { name: 'Aşçı', slug: 'line_cook' },
    { name: 'Barista', slug: 'barista' },
    { name: 'Barmen', slug: 'bartender' },
    { name: 'Kurye', slug: 'delivery_driver' },
    { name: 'Komi', slug: 'busser' },
  ]

  return (
    <footer className="bg-secondary-900 text-secondary-300 mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/android-chrome-192x192.png"
                alt="Yeme İçme İşleri"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-white">Yeme İçme İşleri</span>
            </Link>
            <p className="text-sm text-secondary-400 leading-relaxed">
              Restoran, kafe ve otel sektöründe iş arayanlar ile işverenleri buluşturan platform.
            </p>
          </div>

          {/* İş Arayanlar */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">İş Arayanlar</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/ilanlar" className="text-sm hover:text-white transition-colors">
                  İş İlanları
                </Link>
              </li>
              <li>
                <Link href="/giris" className="text-sm hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/kayit" className="text-sm hover:text-white transition-colors">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* İşverenler */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">İşverenler</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/isveren/giris" className="text-sm hover:text-white transition-colors">
                  İşveren Girişi
                </Link>
              </li>
              <li>
                <Link href="/isveren/kayit" className="text-sm hover:text-white transition-colors">
                  Ücretsiz İlan Ver
                </Link>
              </li>
            </ul>
          </div>

          {/* Popüler Pozisyonlar */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Pozisyonlar</h4>
            <ul className="space-y-2.5">
              {popularPositions.map((pos) => (
                <li key={pos.slug}>
                  <Link
                    href={`/ilanlar?position=${pos.slug}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {pos.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Şehirler */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Şehirler</h4>
            <ul className="space-y-2.5">
              {popularCities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/ilanlar/${city.slug}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-800">
        <div className="container mx-auto px-4 py-5">
          <p className="text-sm text-secondary-500 text-center">
            © {currentYear} Yeme İçme İşleri
          </p>
        </div>
      </div>
    </footer>
  )
}
