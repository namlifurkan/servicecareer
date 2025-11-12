# ServiceCareer - Hizmet Sektörü İş İlanları ve CRM Platformu

Kurumsal odaklı, SEO-optimized iş ilanları ve CRM platformu. Next.js 15, Supabase ve Cloudflare Pages ile geliştirilmiştir.

## Özellikler

### SEO ve Görünürlük
- ✅ SEO-dostu URL yapısı (`/ilanlar/istanbul`, `/ilanlar/ankara`)
- ✅ Server-Side Rendering (SSR) ve Incremental Static Regeneration (ISR)
- ✅ Structured Data (Schema.org) entegrasyonu
- ✅ Footer'da şehir bazlı SEO linkleri
- ✅ Meta tags ve Open Graph optimizasyonu

### Teknik Özellikler
- ✅ Next.js 15 App Router
- ✅ TypeScript
- ✅ Supabase (Database, Auth, RLS)
- ✅ Tailwind CSS (3 renk paleti: Primary Blue, Secondary Gray, Accent Red)
- ✅ Lucide Icons (emoji kullanılmamıştır)
- ✅ Responsive tasarım (mobil dahil)
- ✅ Cloudflare Pages deployment

### İş Akışı
- ✅ Üç kademeli CRM yapısı (Kurum, Aday, Admin)
- ✅ Freemium model ile ücretlendirme
- ✅ Telefon gösterim takibi (phone_reveals tablosu)
- ✅ Gelişmiş filtreleme sistemi
- ✅ Row Level Security (RLS) politikaları

## Kurulum

### 1. Bağımlılıkları Yükleyin
\`\`\`bash
npm install
\`\`\`

### 2. Supabase Yapılandırması

#### Supabase CLI Kurulumu
\`\`\`bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
\`\`\`

#### Local Supabase Başlatma
\`\`\`bash
# Supabase'i başlat
npm run supabase:start

# Veritabanı tiplerini oluştur
npm run supabase:gen-types
\`\`\`

#### Supabase Projesi Bağlama (Production)
\`\`\`bash
# Supabase'e giriş yap
supabase login

# Projeyi bağla
supabase link --project-ref your-project-ref

# Migration'ları uygula
supabase db push
\`\`\`

### 3. Environment Variables

\`.env.local\` dosyası oluşturun:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. Development Server

\`\`\`bash
npm run dev
\`\`\`

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Veritabanı Şeması

### Ana Tablolar
- **profiles**: Kullanıcı profilleri (auth.users genişletmesi)
- **companies**: Şirket bilgileri
- **jobs**: İş ilanları
- **candidate_profiles**: Aday profilleri
- **applications**: İş başvuruları
- **phone_reveals**: Telefon gösterim takibi
- **categories**: İlan kategorileri
- **favorites**: Favori ilanlar

### Önemli Özellikler
- Row Level Security (RLS) tüm tablolarda aktif
- Otomatik timestamp güncellemeleri (triggers)
- İlan sayacı otomasyonu
- Telefon gösterim ve başvuru sayacı

## Deployment (Cloudflare Pages)

### 1. Build
\`\`\`bash
npm run build
\`\`\`

### 2. Cloudflare Pages Deployment

\`\`\`bash
# Cloudflare Pages CLI kurulumu
npm install -g wrangler

# Deploy
wrangler pages deploy out
\`\`\`

### 3. Environment Variables (Production)

Cloudflare Pages dashboard'da aşağıdaki environment variables'ı ayarlayın:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`NEXT_PUBLIC_SITE_URL\`

## Proje Yapısı

\`\`\`
servicecareer/
├── app/                          # Next.js App Router
│   ├── ilanlar/                  # İş ilanları sayfaları
│   │   ├── page.tsx             # Tüm ilanlar
│   │   └── [city]/page.tsx      # Şehir bazlı ilanlar (SEO)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Ana sayfa
│   └── globals.css              # Global stiller
├── components/                   # Reusable components
│   ├── job-filters.tsx          # Gelişmiş filtreleme
│   ├── phone-reveal.tsx         # Telefon takip bileşeni
│   └── footer.tsx               # SEO-optimized footer
├── lib/                         # Utility functions
│   ├── supabase/                # Supabase client
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── database.types.ts        # TypeScript types
│   └── utils.ts                 # Helper functions
├── supabase/                    # Supabase configuration
│   ├── config.toml             # Supabase CLI config
│   └── migrations/              # Database migrations
│       └── 20240101000000_initial_schema.sql
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
\`\`\`

## Tasarım Sistemi

### Renk Paleti (3 Ana Renk)
- **Primary (Mavi)**: #0ea5e9 - Ana CTA ve linkler
- **Secondary (Gri)**: #64748b - Metin ve border
- **Accent (Kırmızı)**: #ef4444 - Önemli aksiyonlar ve uyarılar

### Tasarım Prensipleri
- ❌ Emoji kullanımı yasak
- ❌ Gradient kullanımı yasak
- ✅ Shadcn/ui bileşenleri
- ✅ Lucide React ikonları
- ✅ Kurumsal ve profesyonel görünüm

## Önemli Özellikler

### 1. SEO-Friendly Job Listings
- Şehir bazlı dinamik route'lar: `/ilanlar/[city]`
- ISR ile 5 dakikada bir yenileme
- Structured Data (JobPosting schema)
- Breadcrumb navigation

### 2. Phone Click Tracking
\`\`\`typescript
// components/phone-reveal.tsx
// Supabase'e otomatik kayıt
// User ID, IP, User Agent tracking
\`\`\`

### 3. Advanced Filtering
- Gelişmiş filtreleme paneli
- Şehir, çalışma şekli, deneyim seviyesi
- Maaş aralığı ve uzaktan çalışma filtreleri
- State management ile real-time filtering

### 4. Footer SEO Links
- 12 popüler şehir linki
- SEO-friendly anchor text
- Organized navigation structure

## Scripts

\`\`\`bash
# Development
npm run dev              # Development server
npm run build           # Production build
npm run start           # Production server

# Supabase
npm run supabase:start  # Local Supabase başlat
npm run supabase:stop   # Local Supabase durdur
npm run supabase:status # Supabase durumunu kontrol et
npm run supabase:gen-types # TypeScript tiplerini oluştur

# Cloudflare Pages
npm run pages:build     # Build for Cloudflare
npm run pages:deploy    # Deploy to Cloudflare
\`\`\`

## Güvenlik

- Row Level Security (RLS) tüm tablolarda aktif
- Supabase Auth entegrasyonu
- Environment variables ile güvenli yapılandırma
- SQL injection koruması (Supabase parametrized queries)

## Performans

- ISR (Incremental Static Regeneration)
- Image optimization (Next.js Image component)
- Code splitting (App Router)
- SEO optimizasyonu

## Lisans

Proprietary - Tüm hakları saklıdır.
