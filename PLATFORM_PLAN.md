# ServiceCareer - Hizmet Sektörü Platform Planı

## Vizyon

Türkiye'nin **restoran, kafe, bar, pub ve yiyecek-içecek sektörü** için biçilmiş kaftan iş platformu. Garsondan şefe, baristadan kuryeye - sektörün tüm pozisyonları için özelleştirilmiş çözümler.

---

## Kullanıcı Tipleri ve Akışları

### 1. ADAY (Candidate)

#### Profil Yapısı
```
├── Kişisel Bilgiler
│   ├── Ad Soyad, Telefon, E-posta
│   ├── Doğum Tarihi, Cinsiyet
│   ├── Şehir, İlçe
│   ├── Profil Fotoğrafı
│   └── Kısa Biyografi
│
├── Mesleki Bilgiler
│   ├── Pozisyon Tercihleri (Çoklu seçim: Garson, Barista, Aşçı vb.)
│   ├── Deneyim Yılı (Sektöre özel: 0-1, 1-3, 3-5, 5-10, 10+)
│   ├── Mutfak Uzmanlıkları (Türk, İtalyan, Uzak Doğu vb.)
│   ├── Çalışabileceği Mekan Tipleri (Fine Dining, Cafe, Pub vb.)
│   └── Tercih Ettiği Vardiyalar
│
├── Sertifikalar & Belgeler
│   ├── Hijyen Sertifikası (Zorunlu göster)
│   ├── Sağlık Karnesi/Portör Muayenesi
│   ├── Mesleki Sertifikalar (Barista, Sommelier vb.)
│   ├── Ehliyet (Kuryeler için)
│   └── Dil Sertifikaları
│
├── Deneyimler (İş Geçmişi)
│   ├── Mekan Adı, Pozisyon
│   ├── Çalışma Tarihleri
│   ├── Mekan Tipi
│   ├── Görev Tanımı
│   └── Referans Kişi (İsteğe bağlı)
│
├── Yetenekler
│   ├── Teknik Yetenekler (Latte Art, Kokteyl, Izgara vb.)
│   ├── Diller (Seviye ile: İngilizce - B2)
│   ├── POS/Yazarkasa Deneyimi
│   └── Özel Yetenekler
│
├── Araç Bilgileri (Kuryeler için)
│   ├── Araç Tipi (Motor, Bisiklet, Araba)
│   ├── Araç Yılı
│   └── Ehliyet Sınıfı
│
└── Tercihler
    ├── Maaş Beklentisi (Aralık)
    ├── Çalışma Şekli (Tam/Part-time)
    ├── Tercih Edilen Bölgeler
    ├── Ne Zaman Başlayabilir
    └── İş Arıyor mu? (Toggle)
```

#### Aday Dashboard Sayfaları
```
/dashboard
├── Ana Sayfa (Özet)
│   ├── Başvuru Durumları
│   ├── Profil Tamamlama Yüzdesi
│   ├── Önerilen İlanlar
│   └── Son Görüntülenen İlanlar
│
├── /dashboard/profil
│   ├── Profil Düzenleme
│   ├── Fotoğraf Yükleme
│   └── Profil Önizleme
│
├── /dashboard/deneyimler
│   ├── Deneyim Ekleme/Düzenleme
│   ├── Sertifika Yükleme
│   └── Referans Ekleme
│
├── /dashboard/basvurularim
│   ├── Tüm Başvurular (Filtrelenebilir)
│   ├── Başvuru Detayı
│   └── Başvuru Durumu Timeline
│
├── /dashboard/favorilerim
│   └── Kaydedilen İlanlar
│
├── /dashboard/mesajlar
│   ├── İşveren Mesajları
│   └── Sistem Bildirimleri
│
└── /dashboard/ayarlar
    ├── Bildirim Tercihleri
    ├── Gizlilik Ayarları
    └── Hesap Silme
```

---

### 2. İŞVEREN (Company)

#### Şirket Profil Yapısı
```
├── İşletme Bilgileri
│   ├── İşletme Adı
│   ├── Logo
│   ├── Mekan Tipi (Restoran, Kafe, Bar, Pub vb.)
│   ├── Mutfak Türü (Çoklu)
│   ├── Kuruluş Yılı
│   ├── Çalışan Sayısı
│   └── Açıklama/Hakkında
│
├── İletişim Bilgileri
│   ├── Adres (Harita entegrasyonu)
│   ├── Telefon
│   ├── E-posta
│   ├── Website
│   └── Sosyal Medya
│
├── Çalışma Koşulları (Genel)
│   ├── Üniforma Politikası
│   ├── Yemek Politikası
│   ├── Servis/Bahşiş Sistemi
│   ├── Sigorta Durumu
│   └── Konaklama (Varsa)
│
├── Fotoğraflar
│   ├── Mekan Fotoğrafları
│   ├── Mutfak
│   └── Ekip Fotoğrafları
│
└── Doğrulama
    ├── Vergi Levhası
    ├── İşletme Ruhsatı
    └── Doğrulanmış Rozeti
```

#### İşveren Dashboard Sayfaları
```
/isveren/dashboard
├── Ana Sayfa (Özet)
│   ├── Aktif İlan Sayısı
│   ├── Toplam Başvuru
│   ├── Bu Hafta Yeni Başvurular
│   ├── Telefon Görüntüleme İstatistikleri
│   └── Paket Bilgisi & Kalan Haklar
│
├── /isveren/dashboard/ilanlarim
│   ├── Aktif İlanlar
│   ├── Taslaklar
│   ├── Kapanan İlanlar
│   └── İlan İstatistikleri (Her ilan için)
│
├── /isveren/dashboard/ilan-olustur
│   └── Yeni İlan Oluşturma Formu (Detay aşağıda)
│
├── /isveren/dashboard/basvurular
│   ├── Tüm Başvurular (Filtrelenebilir)
│   ├── Yeni Başvurular
│   ├── Ön Seçim
│   ├── Mülakat Aşaması
│   ├── Teklif Aşaması
│   └── İşe Alınanlar
│
├── /isveren/dashboard/aday-havuzu
│   ├── Aday Arama (Gelişmiş filtreler)
│   ├── Kaydedilen Adaylar
│   └── Davet Gönderilen Adaylar
│
├── /isveren/dashboard/mesajlar
│   ├── Aday Mesajları
│   └── Toplu Mesaj Gönderme
│
├── /isveren/dashboard/profil
│   ├── İşletme Bilgileri
│   ├── Fotoğraflar
│   └── Doğrulama Belgeleri
│
├── /isveren/dashboard/istatistikler
│   ├── İlan Performansları
│   ├── Başvuru Analizleri
│   └── Karşılaştırmalı Raporlar
│
└── /isveren/dashboard/ayarlar
    ├── Bildirim Tercihleri
    ├── Ekip Üyeleri (Çoklu kullanıcı)
    └── Fatura Bilgileri
```

---

### 3. ADMİN

#### Admin Dashboard
```
/admin
├── Ana Sayfa
│   ├── Platform İstatistikleri
│   ├── Günlük/Haftalık/Aylık Grafikler
│   └── Kritik Uyarılar
│
├── /admin/users
│   ├── Tüm Kullanıcılar
│   ├── Adaylar
│   ├── İşverenler
│   └── Kullanıcı Detay/Düzenleme
│
├── /admin/companies
│   ├── Tüm İşletmeler
│   ├── Doğrulama Bekleyenler
│   └── İşletme Detay
│
├── /admin/jobs
│   ├── Tüm İlanlar
│   ├── Onay Bekleyenler
│   ├── Şikayet Edilenler
│   └── İlan Detay
│
├── /admin/applications
│   └── Başvuru İstatistikleri
│
├── /admin/categories
│   ├── Kategori Yönetimi
│   └── Pozisyon Yönetimi
│
├── /admin/reports
│   ├── Şikayetler
│   ├── Spam/Sahte İlanlar
│   └── Kullanıcı Raporları
│
├── /admin/content
│   ├── Blog Yazıları
│   ├── SSS
│   └── Statik Sayfalar
│
└── /admin/settings
    ├── Platform Ayarları
    ├── E-posta Şablonları
    └── Paket/Fiyatlandırma
```

---

## İlan Oluşturma Akışı (İşveren)

### Adım 1: Temel Bilgiler
```
├── İlan Başlığı (Otomatik öneri: "Deneyimli Garson Aranıyor")
├── Pozisyon Tipi (Dropdown - Detaylı liste)
├── Kategori (Otomatik atanır pozisyona göre)
├── Aciliyet Durumu (Normal / Acil / Çok Acil)
└── Çalışma Şekli (Tam Zamanlı / Part-time / Dönemsel / Staj)
```

### Adım 2: Detaylar
```
├── İş Tanımı (Rich text editor)
├── Aranan Özellikler
│   ├── Deneyim Seviyesi
│   ├── Eğitim (Lise, Ön lisans, vb.)
│   ├── Yaş Aralığı (İsteğe bağlı)
│   ├── Cinsiyet Tercihi (İsteğe bağlı)
│   └── Dil Gereksinimleri
│
├── Zorunlu Sertifikalar (Çoklu seçim)
│   ├── Hijyen Sertifikası
│   ├── Sağlık Karnesi
│   ├── Alkol Satış Belgesi
│   └── Ehliyet (Kurye için)
│
└── Tercih Edilen Yetenekler
    ├── Mutfak Türleri (Aşçı için)
    ├── POS Deneyimi
    ├── Latte Art (Barista için)
    └── Kokteyl Bilgisi (Barmen için)
```

### Adım 3: Koşullar
```
├── Maaş Bilgisi
│   ├── Maaş Gösterilsin mi?
│   ├── Ödeme Tipi (Aylık/Haftalık/Günlük/Saatlik)
│   ├── Minimum - Maximum Aralık
│   └── Ek Bilgi (Bahşiş hariç, yemek dahil vb.)
│
├── Çalışma Saatleri
│   ├── Vardiya Tipi(leri)
│   ├── Haftalık Çalışma Günleri
│   └── Tahmini Haftalık Saat
│
├── Yan Haklar (Çoklu seçim)
│   ├── Yemek
│   ├── Servis/Ulaşım
│   ├── Sigorta (SGK)
│   ├── Prim/Bonus
│   ├── Konaklama
│   └── Bahşiş/Tip
│
└── Bahşiş Politikası
    ├── Bireysel
    ├── Havuz
    ├── Servis Ücreti Dahil
    └── Bahşiş Yok
```

### Adım 4: Konum & İletişim
```
├── Şehir
├── İlçe
├── Açık Adres (İsteğe bağlı)
├── Harita Konumu
└── İletişim Tercihi
    ├── Platform üzerinden
    ├── Telefon göster
    └── WhatsApp
```

### Adım 5: Önizleme & Yayınla
```
├── İlan Önizleme
├── Öne Çıkarma Seçenekleri
│   ├── Normal (Ücretsiz)
│   ├── Öne Çıkan (7 gün)
│   └── Premium (30 gün + renkli)
└── Yayınla / Taslak Kaydet
```

---

## İlan Listeleme Sayfası (/ilanlar)

### Filtreler (Sol Sidebar)
```
├── Arama (Başlık, açıklama içinde)
│
├── Pozisyon Tipi
│   ├── Mutfak
│   │   ├── Şef
│   │   ├── Aşçı
│   │   ├── Aşçı Yardımcısı
│   │   └── Bulaşıkçı
│   ├── Servis
│   │   ├── Garson
│   │   ├── Komi
│   │   └── Host/Hostes
│   ├── Bar
│   │   ├── Barmen
│   │   ├── Barista
│   │   └── Bar Yardımcısı
│   └── Teslimat
│       ├── Motorlu Kurye
│       └── Bisikletli Kurye
│
├── Şehir / İlçe
│
├── Mekan Tipi
│   ├── Restoran
│   ├── Kafe
│   ├── Bar/Pub
│   ├── Otel
│   └── Fast Food
│
├── Çalışma Şekli
│   ├── Tam Zamanlı
│   ├── Part-time
│   ├── Dönemsel/Sezonluk
│   └── Staj
│
├── Deneyim Seviyesi
│   ├── Deneyimsiz (Yetiştirilir)
│   ├── 0-1 Yıl
│   ├── 1-3 Yıl
│   ├── 3-5 Yıl
│   └── 5+ Yıl
│
├── Maaş Aralığı (Slider)
│
├── Vardiya
│   ├── Sabah
│   ├── Öğlen
│   ├── Akşam
│   ├── Gece
│   └── Esnek
│
├── Yan Haklar
│   ├── Yemek Verilir
│   ├── Servis Verilir
│   ├── SGK Yapılır
│   ├── Bahşiş Var
│   └── Konaklama
│
└── Diğer
    ├── Sadece Doğrulanmış İşletmeler
    ├── Acil İlanlar
    └── Son 24 Saat
```

### İlan Kartı Bilgileri
```
┌─────────────────────────────────────────┐
│ [Logo]  İŞLETME ADI         ✓ Doğrulanmış
│         Kadıköy, İstanbul
│─────────────────────────────────────────│
│ GARSON ARANIYOR                 🔥 Acil │
│                                         │
│ 💰 25.000₺ - 30.000₺ + Bahşiş          │
│ 🕐 Tam Zamanlı | Akşam Vardiyası       │
│ 📍 Kadıköy, İstanbul                    │
│                                         │
│ ✓ Yemek  ✓ Servis  ✓ SGK  ✓ Bahşiş    │
│                                         │
│ 1-3 Yıl Deneyim | Erkek                │
│─────────────────────────────────────────│
│ 📅 2 saat önce    👁 145    📱 23      │
│                        [❤️] [BAŞVUR]    │
└─────────────────────────────────────────┘
```

---

## İlan Detay Sayfası (/ilan/[slug])

### Sayfa Yapısı
```
┌─────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Ana Sayfa > İlanlar > Garson > İlan Başlığı    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐                                               │
│  │  LOGO   │  İŞLETME ADI                    ✓ Doğrulanmış │
│  └─────────┘  Restoran | Fine Dining | Kadıköy            │
│               ⭐ 4.8 (23 değerlendirme)                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DENEYİMLİ GARSON ARANIYOR                                  │
│                                                             │
│  💰 25.000₺ - 30.000₺ /ay + Bahşiş                         │
│  🕐 Tam Zamanlı | Akşam Vardiyası (18:00 - 02:00)         │
│  📍 Kadıköy, Moda Mahallesi, İstanbul                      │
│  📅 Yayın: 2 saat önce | Son başvuru: 15 gün              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [📞 TELEFONU GÖSTER]  [💬 MESAJ GÖNDER]  [❤️ KAYDET]│  │
│  │                                                      │  │
│  │  [        HEMEN BAŞVUR (CV Gerekmez)        ]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  TABS: [İş Detayı] [Gereksinimler] [İşletme] [Konum]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  İŞ TANIMI                                                  │
│  ─────────                                                  │
│  Moda'nın en prestijli restoranlarından birinde...         │
│                                                             │
│  GÖREVLER                                                   │
│  ────────                                                   │
│  • Müşteri karşılama ve masaya yönlendirme                 │
│  • Sipariş alma ve servis                                   │
│  • Müşteri memnuniyeti takibi                              │
│  • Kasa işlemleri                                           │
│                                                             │
│  YAN HAKLAR                                                 │
│  ──────────                                                 │
│  ✓ Yemek (Tüm öğünler)                                     │
│  ✓ Servis (Gece 02:00 sonrası)                             │
│  ✓ SGK + Prim                                               │
│  ✓ Bahşiş (Bireysel sistem)                                │
│  ✓ Üniforma verilir                                        │
│                                                             │
│  ÇALIŞMA SAATLERİ                                           │
│  ─────────────────                                          │
│  • Salı - Pazar (Pazartesi tatil)                          │
│  • 18:00 - 02:00 (Akşam vardiyası)                         │
│  • Haftalık 48 saat                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ARANAN ÖZELLİKLER                                          │
│  ──────────────────                                         │
│                                                             │
│  Deneyim: 1-3 Yıl (Fine Dining tercih sebebi)              │
│  Eğitim: En az lise mezunu                                  │
│  Yaş: 22-35                                                 │
│  Cinsiyet: Erkek                                            │
│                                                             │
│  ZORUNLU BELGELER                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ 🏥 Sağlık │ │ 🧼 Hijyen  │ │ 🍷 Alkol   │              │
│  │   Karnesi │ │ Sertifika  │ │   Belgesi  │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                             │
│  TERCİH EDİLEN YETENEKLİKLER                                │
│  • İngilizce (Orta seviye)                                  │
│  • POS/Adisyon programı deneyimi                           │
│  • Şarap bilgisi                                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  İŞLETME HAKKINDA                                           │
│  ─────────────────                                          │
│                                                             │
│  [Mekan Fotoğrafları Carousel]                              │
│                                                             │
│  Restoran Adı                                               │
│  Kuruluş: 2018 | Çalışan: 25-50 kişi                       │
│  Mutfak: Türk Mutfağı, Akdeniz                             │
│  Mekan Tipi: Fine Dining Restoran                          │
│                                                             │
│  Moda'nın kalbinde, İstanbul Boğazı manzaralı...           │
│                                                             │
│  [→ İşletmenin Tüm İlanlarını Gör (3)]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  KONUM                                                      │
│  ──────                                                     │
│  [Google Maps Embed]                                        │
│  Moda Caddesi No:123, Kadıköy/İstanbul                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BENZER İLANLAR                                             │
│  ─────────────                                              │
│  [İlan Kartı] [İlan Kartı] [İlan Kartı]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Başvuru Akışı

### Senaryo 1: Kayıtlı Aday (Hızlı Başvuru)
```
1. "Hemen Başvur" butonuna tıkla
2. Modal açılır:
   ┌─────────────────────────────────────┐
   │  HIZLI BAŞVURU                      │
   │                                     │
   │  ✓ Profil bilgilerin kullanılacak  │
   │  ✓ Sertifikaların paylaşılacak     │
   │                                     │
   │  Ön Yazı (İsteğe bağlı):           │
   │  ┌─────────────────────────────┐   │
   │  │                             │   │
   │  └─────────────────────────────┘   │
   │                                     │
   │  ☐ WhatsApp'tan da ulaşabilirsiniz│
   │                                     │
   │  [        BAŞVURUYU GÖNDER        ]│
   └─────────────────────────────────────┘
3. Başvuru anında gönderilir
4. İşverene bildirim gider
```

### Senaryo 2: Misafir Başvuru (CV Gerekmez)
```
1. "Hemen Başvur" butonuna tıkla
2. Modal açılır:
   ┌─────────────────────────────────────┐
   │  HIZLI BAŞVURU (Kayıt Gerekmez)    │
   │                                     │
   │  Ad Soyad*: [________________]     │
   │  Telefon*:  [________________]     │
   │  E-posta:   [________________]     │
   │                                     │
   │  Pozisyon Deneyiminiz:             │
   │  ○ Deneyimsizim                    │
   │  ○ 0-1 Yıl                         │
   │  ○ 1-3 Yıl                         │
   │  ○ 3+ Yıl                          │
   │                                     │
   │  Kısa Not (İsteğe bağlı):          │
   │  ┌─────────────────────────────┐   │
   │  │                             │   │
   │  └─────────────────────────────┘   │
   │                                     │
   │  ☐ Beni arayabilirsiniz           │
   │  ☐ Kullanım koşullarını kabul...  │
   │                                     │
   │  [        BAŞVURUYU GÖNDER        ]│
   │                                     │
   │  ─────────── veya ──────────────  │
   │                                     │
   │  Üye ol ve profilini oluştur →     │
   └─────────────────────────────────────┘
3. Captcha doğrulaması
4. Başvuru gönderilir
```

---

## İşveren - Başvuru Yönetimi

### Başvuru Listesi Görünümü
```
┌─────────────────────────────────────────────────────────────┐
│  BAŞVURULAR                                   [🔍 Filtrele]│
│  ─────────                                                  │
│  [Tümü (45)] [Yeni (12)] [Ön Seçim (8)] [Mülakat (3)]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Ahmet Yılmaz                    YENİ 🔴  │   │
│  │           Garson İlanına Başvurdu                   │   │
│  │           3 Yıl Deneyim | Kadıköy                   │   │
│  │           ✓ Hijyen  ✓ Sağlık Karnesi               │   │
│  │           ────────────────────────────────────────  │   │
│  │           📅 30 dk önce                             │   │
│  │           [Profili Gör] [Reddet] [Ön Seçime Al]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Mehmet Kaya                   ÖN SEÇİM   │   │
│  │           ...                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Aday Profil Görüntüleme (İşveren Tarafı)
```
┌─────────────────────────────────────────────────────────────┐
│  [← Geri]                          [❌ Reddet] [✓ İlerlet] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐                                                │
│  │ AVATAR │  AHMET YILMAZ                                  │
│  └────────┘  Deneyimli Garson | 3 Yıl                      │
│              📍 Kadıköy, İstanbul                          │
│              📞 0532 *** ** **  [Göster - 1 Hak]           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  HAKKINDA                                                   │
│  ────────                                                   │
│  5 yıldır yiyecek içecek sektöründe çalışıyorum...        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  DENEYİMLER                                                 │
│  ──────────                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ RESTORAN ADI                        2021 - 2024    │   │
│  │ Garson / Baş Garson                                │   │
│  │ Fine Dining Restoran                               │   │
│  │ "Müşteri ilişkileri ve servis kalitesi..."        │   │
│  │ 📞 Referans: Ali Bey (Müdür) [Doğrulanmış ✓]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SERTİFİKALAR                                               │
│  ────────────                                               │
│  ✓ Hijyen Sertifikası (2024)                               │
│  ✓ Sağlık Karnesi (Geçerli)                                │
│  ✓ İngilizce B2                                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YETENEKLİKLER                                              │
│  ─────────────                                              │
│  [Şarap Servisi] [POS Kullanımı] [İngilizce]              │
│  [Müşteri İlişkileri] [Adisyon Takibi]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  TERCİHLER                                                  │
│  ─────────                                                  │
│  💰 Maaş Beklentisi: 25.000₺ - 30.000₺                    │
│  🕐 Çalışma Şekli: Tam Zamanlı                             │
│  📍 Tercih Edilen Bölge: Kadıköy, Beşiktaş                 │
│  📅 Ne Zaman Başlayabilir: Hemen                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BAŞVURU NOTU                                               │
│  ─────────────                                              │
│  "İlanınızı gördüm, 3 yıllık fine dining deneyimim..."    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [💬 Mesaj Gönder]  [📅 Mülakat Planla]  [📝 Not Ekle]    │
│                                                             │
│  DURUM: ──●────────────────────────────────────────        │
│          Yeni > Görüldü > Ön Seçim > Mülakat > Teklif     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Özellik Listesi (Öncelik Sırasıyla)

### Faz 1: Temel Özellikler (MVP+)
```
1. Genişletilmiş Aday Profili
   - Pozisyon bazlı özelleştirme
   - Sertifika yönetimi
   - Deneyim ekleme (sektöre özel alanlar)
   - Yetenek etiketleri

2. Gelişmiş İlan Oluşturma
   - Pozisyon bazlı form alanları
   - Yan haklar seçimi
   - Vardiya/çalışma saatleri
   - Maaş aralığı + ödeme tipi

3. Akıllı Filtreleme
   - Pozisyon tipi hiyerarşisi
   - Mekan tipi filtresi
   - Yan haklar filtresi
   - Vardiya filtresi

4. Hızlı Başvuru
   - Misafir başvuru (CV gerekmez)
   - Tek tık başvuru (üye için)
   - WhatsApp entegrasyonu

5. Başvuru Yönetimi (İşveren)
   - Kanban görünümü
   - Durum takibi
   - Toplu işlemler
   - Not ekleme
```

### Faz 2: Gelişmiş Özellikler
```
6. Referans Sistemi
   - Eski işverenden referans isteme
   - Referans doğrulama (telefon/email)
   - Referans puanı

7. Aday Havuzu (İşveren)
   - Aday arama
   - Filtreleme
   - Aday kaydetme
   - Davet gönderme

8. Bildirim Sistemi
   - E-posta bildirimleri
   - Push notifications
   - WhatsApp bildirimleri
   - SMS (opsiyonel)

9. Değerlendirme Sistemi
   - İşveren değerlendirmesi (aday tarafından)
   - Çalışma ortamı puanı
   - Maaş doğruluğu
   - Anonim yorumlar

10. Mesajlaşma
    - Platform içi mesajlaşma
    - Şablon mesajlar
    - Toplu mesaj
```

### Faz 3: Premium Özellikler
```
11. Paket Sistemi
    - Ücretsiz / Başlangıç / Profesyonel / Kurumsal
    - İlan limitleri
    - Öne çıkarma hakları
    - Aday erişimi

12. İstatistikler & Raporlar
    - İlan performansı
    - Başvuru analizleri
    - Pazar karşılaştırması

13. API & Entegrasyonlar
    - Kariyer siteleri entegrasyonu
    - POS/ERP entegrasyonu
    - WhatsApp Business API

14. Mobil Uygulama
    - iOS & Android
    - Push notifications
    - Hızlı başvuru
```

---

## Veritabanı Şeması (Yeni Tablolar)

### Migration Listesi
```
20241220000001_service_industry_enums.sql        ✓ Oluşturuldu
20241220000002_extended_candidate_profiles.sql
20241220000003_candidate_experiences.sql
20241220000004_candidate_certificates.sql
20241220000005_candidate_skills.sql
20241220000006_extended_jobs.sql
20241220000007_job_benefits.sql
20241220000008_job_requirements.sql
20241220000009_working_hours.sql
20241220000010_salary_ranges.sql
20241220000011_reference_system.sql
20241220000012_guest_applications_extended.sql
20241220000013_notifications.sql
20241220000014_messages.sql
20241220000015_reviews.sql
20241220000016_employer_saved_candidates.sql
20241220000017_packages_subscriptions.sql
20241220000018_rls_policies.sql
20241220000019_functions_triggers.sql
20241220000020_seed_positions.sql
```

---

## Sayfa Listesi (Tüm Routes)

### Public Sayfalar
```
/                           Ana sayfa
/ilanlar                    İlan listesi
/ilanlar/[city]             Şehre göre ilanlar
/ilanlar/[city]/[district]  İlçeye göre ilanlar
/ilan/[slug]                İlan detay
/sirketler                  Şirket listesi
/sirket/[slug]              Şirket profili
/pozisyonlar                Pozisyon listesi
/pozisyonlar/[slug]         Pozisyona göre ilanlar (garson, barista vb.)
/hakkimizda                 Hakkımızda
/iletisim                   İletişim
/blog                       Blog
/blog/[slug]                Blog yazısı
/sss                        Sıkça Sorulan Sorular
/gizlilik                   Gizlilik Politikası
/kullanim-kosullari         Kullanım Koşulları
```

### Auth Sayfalar
```
/giris                      Aday girişi
/kayit                      Aday kaydı
/isveren/giris              İşveren girişi
/isveren/kayit              İşveren kaydı
/sifremi-unuttum            Şifre sıfırlama
/sifre-sifirla              Yeni şifre belirleme
```

### Aday Dashboard
```
/dashboard                          Ana sayfa
/dashboard/profil                   Profil düzenleme
/dashboard/profil/deneyimler        Deneyim yönetimi
/dashboard/profil/sertifikalar      Sertifika yönetimi
/dashboard/profil/yetenekler        Yetenek yönetimi
/dashboard/basvurularim             Başvurularım
/dashboard/basvurularim/[id]        Başvuru detayı
/dashboard/favorilerim              Favori ilanlar
/dashboard/mesajlar                 Mesajlar
/dashboard/mesajlar/[id]            Mesaj detayı
/dashboard/bildirimler              Bildirimler
/dashboard/ayarlar                  Hesap ayarları
```

### İşveren Dashboard
```
/isveren/dashboard                      Ana sayfa
/isveren/dashboard/ilanlarim            İlanlarım
/isveren/dashboard/ilan-olustur         Yeni ilan
/isveren/dashboard/ilan-duzenle/[id]    İlan düzenleme
/isveren/dashboard/basvurular           Tüm başvurular
/isveren/dashboard/basvurular/[id]      Başvuru detayı
/isveren/dashboard/aday-havuzu          Aday arama
/isveren/dashboard/kaydedilenler        Kaydedilen adaylar
/isveren/dashboard/mesajlar             Mesajlar
/isveren/dashboard/mesajlar/[id]        Mesaj detayı
/isveren/dashboard/profil               Şirket profili
/isveren/dashboard/istatistikler        İstatistikler
/isveren/dashboard/paket                Paket bilgisi
/isveren/dashboard/ayarlar              Ayarlar
```

### Admin Dashboard
```
/admin                          Ana sayfa
/admin/users                    Kullanıcılar
/admin/users/[id]               Kullanıcı detayı
/admin/companies                Şirketler
/admin/companies/[id]           Şirket detayı
/admin/jobs                     İlanlar
/admin/jobs/[id]                İlan detayı
/admin/applications             Başvurular
/admin/categories               Kategoriler
/admin/positions                Pozisyonlar
/admin/reports                  Raporlar
/admin/content                  İçerik yönetimi
/admin/settings                 Ayarlar
```

---

## Sonraki Adımlar

1. **Migration'ları çalıştır** - Aşağıda oluşturacağım dosyaları Supabase'de çalıştır
2. **TypeScript tiplerini güncelle** - database.types.ts
3. **Component'ları oluştur** - Yeni form alanları, filtreler
4. **Sayfa route'larını ekle** - Yeni sayfalar
5. **API route'larını oluştur** - Yeni endpoint'ler

---

Bu plan onaylandıysa, migration dosyalarını oluşturmaya devam edeyim mi?
