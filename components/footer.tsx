import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  // SEO-optimized city links
  const popularCities = [
    { name: 'İstanbul', slug: 'istanbul' },
    { name: 'Ankara', slug: 'ankara' },
    { name: 'İzmir', slug: 'izmir' },
    { name: 'Bursa', slug: 'bursa' },
    { name: 'Antalya', slug: 'antalya' },
    { name: 'Adana', slug: 'adana' },
    { name: 'Gaziantep', slug: 'gaziantep' },
    { name: 'Konya', slug: 'konya' },
    { name: 'Kayseri', slug: 'kayseri' },
    { name: 'Mersin', slug: 'mersin' },
    { name: 'Eskişehir', slug: 'eskisehir' },
    { name: 'Diyarbakır', slug: 'diyarbakir' },
  ]

  const footerLinks = {
    forEmployers: [
      { label: 'İşveren Girişi', href: '/isveren/giris' },
      { label: 'İşveren Kayıt', href: '/isveren/kayit' },
    ],
    forCandidates: [
      { label: 'Giriş Yap', href: '/giris' },
      { label: 'Kayıt Ol', href: '/kayit' },
      { label: 'İş İlanları', href: '/ilanlar' },
    ],
  }

  return (
    <footer className="bg-secondary-50 border-t border-secondary-200 mt-auto">
      {/* SEO-Optimized City Links Section */}
      <div className="border-b border-secondary-200">
        <div className="container mx-auto px-6 py-8">
          <h3 className="text-base font-semibold text-secondary-900 mb-4">
            Şehirlere Göre İş İlanları
          </h3>
          <nav aria-label="Şehir bazlı iş ilanları">
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularCities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/ilanlar/${city.slug}`}
                    className="text-sm text-secondary-600 hover:text-secondary-900 hover:underline transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Employer Links */}
          <div>
            <h4 className="font-semibold text-secondary-900 mb-4 text-sm">İşverenler İçin</h4>
            <ul className="space-y-3">
              {footerLinks.forEmployers.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-600 hover:text-secondary-900 hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Candidate Links */}
          <div>
            <h4 className="font-semibold text-secondary-900 mb-4 text-sm">İş Arayanlar İçin</h4>
            <ul className="space-y-3">
              {footerLinks.forCandidates.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-600 hover:text-secondary-900 hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-600">
            <p>
              © {currentYear} ServiceCareer. Tüm hakları saklıdır.
            </p>
            <p>
              Türkiye&apos;nin güvenilir iş ilanları platformu
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
