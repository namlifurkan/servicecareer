# Supabase Email Yapılandırma Kılavuzu

ServiceCareer platformu için Supabase Auth email sisteminin yapılandırma dokümantasyonu.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Resend SMTP Yapılandırması](#resend-smtp-yapılandırması)
3. [Email Şablonlarını Özelleştirme](#email-şablonlarını-özelleştirme)
4. [Domain Doğrulama](#domain-doğrulama)
5. [Test Kontrol Listesi](#test-kontrol-listesi)
6. [Sorun Giderme](#sorun-giderme)
7. [Environment Variables](#environment-variables)

---

## Genel Bakış

### Email Sistemleri Karşılaştırması

ServiceCareer platformunda iki farklı email sistemi kullanılmaktadır:

#### 1. Supabase Auth Emails (Bu Dokümanda)
**Kullanım Amacı**: Kimlik doğrulama ve hesap yönetimi

| Email Türü | Kullanım Alanı | Tetikleyici |
|------------|----------------|-------------|
| Email Verification | Yeni kayıt sonrası email doğrulama | Kullanıcı kaydolduğunda |
| Password Reset | Şifre sıfırlama linki | "Şifremi Unuttum" tıklandığında |
| Magic Link | Şifresiz giriş (opsiyonel) | Magic link ile giriş seçildiğinde |
| Change Email | Email adresi değişikliği onayı | Kullanıcı email değiştirdiğinde |
| Invite User | Admin tarafından kullanıcı daveti | Admin yeni kullanıcı eklediğinde |

**Yönetim**: Supabase Dashboard → Authentication → Email Templates

#### 2. Custom Transactional Emails (Resend API)
**Kullanım Amacı**: Uygulama bildirimleri ve iş akışları

| Email Türü | Kullanım Alanı | Kod Lokasyonu |
|------------|----------------|---------------|
| Welcome Email | Kayıt sonrası hoş geldin mesajı | `/lib/emails/welcome-email.tsx` |
| Application Confirmation | İş başvurusu onayı | `/lib/emails/application-email.tsx` |
| Application Status | Başvuru durumu güncellemeleri | `/lib/emails/status-update-email.tsx` |

**Yönetim**: Kod bazlı, React Email ile oluşturulan şablonlar

---

## Resend SMTP Yapılandırması

Supabase Auth'un email göndermesi için Resend SMTP kullanımı önerilir. Bu sayede tüm emailler tek bir provider üzerinden yönetilir ve email deliverability artar.

### Adım 1: Resend API Key Oluşturma

1. [Resend Dashboard](https://resend.com/api-keys)'a giriş yapın
2. **API Keys** → **Create API Key** tıklayın
3. İsim: `ServiceCareer - Supabase SMTP`
4. Permission: **Sending access** (Full access gerekmez)
5. API key'i kopyalayın (Format: `re_xxxxxxxxxx`)
6. **GÜVENLİ BİR YERDE SAKLAYIN** - Bir daha gösterilmez

### Adım 2: Supabase SMTP Ayarları

1. Supabase Dashboard'a gidin: https://app.supabase.com/project/YOUR_PROJECT_ID
2. **Project Settings** → **Authentication** menüsüne tıklayın
3. **SMTP Settings** bölümüne gidin
4. **Enable Custom SMTP** toggle'ını aktif edin
5. Aşağıdaki bilgileri girin:

```
Sender email: noreply@servicecareer.com
Sender name: ServiceCareer

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_YOUR_API_KEY_HERE
```

6. **Save** butonuna tıklayın

### SMTP Ayarları Detayları

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| **Host** | `smtp.resend.com` | Resend SMTP sunucusu |
| **Port** | `587` | TLS port (önerilen) |
| **Username** | `resend` | Sabit değer, değiştirmeyin |
| **Password** | `re_xxxxx` | Resend API key'iniz |
| **Sender Email** | `noreply@servicecareer.com` | Doğrulanmış domain gerekli |
| **Sender Name** | `ServiceCareer` | Görünen isim |

### Alternatif Port Seçenekleri

```
Port 587: TLS (Önerilen - En yaygın desteklenen)
Port 465: SSL (Bazı hosting'lerde engellenebilir)
Port 2587: Alternatif TLS (Port 587 engellenirse)
```

### Test Email Gönderme

SMTP yapılandırmasını test etmek için:

1. Supabase Dashboard → **Authentication** → **Users**
2. **Invite user** butonuna tıklayın
3. Test email adresi girin
4. Email'in gelip gelmediğini kontrol edin

Sorun olursa → [Sorun Giderme](#sorun-giderme) bölümüne bakın.

---

## Email Şablonlarını Özelleştirme

Supabase Auth email şablonları Türkçeleştirme ve ServiceCareer branding ekleme.

### Şablon Düzenleme Yolları

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Soldaki menüden düzenlemek istediğin şablonu seç
3. **Subject** ve **Message (Body)** alanlarını güncelle
4. **Save** butonuna tıkla

### Kullanılabilir Template Variables

Supabase şablonlarında kullanılabilir değişkenler:

```html
{{ .ConfirmationURL }}  - Doğrulama/sıfırlama linki
{{ .Token }}            - 6 haneli OTP kodu
{{ .TokenHash }}        - Token hash değeri
{{ .SiteURL }}          - Site URL (env'den)
{{ .Email }}            - Kullanıcı email adresi
{{ .Data.xxx }}         - Custom metadata
```

---

### 1. Confirm Signup (Email Verification)

**Kullanım**: Yeni kayıt sonrası email doğrulama

**Subject (Türkçe)**:
```
ServiceCareer - Email Adresinizi Doğrulayın
```

**Message Body (Türkçe HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 700;">ServiceCareer</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">Hoş Geldiniz!</h2>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ServiceCareer'e kaydolduğunuz için teşekkür ederiz. Hesabınızı aktifleştirmek için lütfen email adresinizi doğrulayın.
              </p>

              <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Aşağıdaki butona tıklayarak email adresinizi doğrulayabilirsiniz:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Email Adresimi Doğrula
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Veya aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                  ⚠️ Güvenlik Uyarısı
                </p>
                <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  Bu doğrulama linki 24 saat geçerlidir. Eğer bu kaydı siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Bu email {{ .Email }} adresine gönderilmiştir.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2024 ServiceCareer. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2. Reset Password

**Kullanım**: Şifre sıfırlama linki gönderme

**Subject (Türkçe)**:
```
ServiceCareer - Şifre Sıfırlama Talebi
```

**Message Body (Türkçe HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 700;">ServiceCareer</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">Şifre Sıfırlama</h2>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ServiceCareer hesabınız için şifre sıfırlama talebinde bulundunuz.
              </p>

              <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Yeni bir şifre belirlemek için aşağıdaki butona tıklayın:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Şifremi Sıfırla
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Veya aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                  ⚠️ Güvenlik Uyarısı
                </p>
                <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  Bu link 1 saat geçerlidir ve yalnızca bir kez kullanılabilir.
                </p>
                <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  Eğer bu talebi siz yapmadıysanız, lütfen bu emaili görmezden gelin ve hesap güvenliğiniz için şifrenizi değiştirin.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Bu email {{ .Email }} adresine gönderilmiştir.
              </p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                IP Adresi: {{ .Data.ip_address }} | Tarih: {{ .Data.timestamp }}
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2024 ServiceCareer. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3. Magic Link (Opsiyonel)

**Kullanım**: Şifresiz giriş (eğer magic link özelliği aktifse)

**Subject (Türkçe)**:
```
ServiceCareer - Giriş Linkiniz
```

**Message Body (Türkçe HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magic Link Giriş</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 700;">ServiceCareer</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">Giriş Linkiniz</h2>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ServiceCareer'e giriş yapmak için özel linkiniz hazır.
              </p>

              <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Aşağıdaki butona tıklayarak tek tıkla giriş yapabilirsiniz:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Giriş Yap
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Veya aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
                <p style="margin: 0; color: #1d4ed8; font-size: 14px; font-weight: 600;">
                  ℹ️ Bilgilendirme
                </p>
                <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  Bu link 15 dakika geçerlidir ve yalnızca bir kez kullanılabilir.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Bu email {{ .Email }} adresine gönderilmiştir.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2024 ServiceCareer. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 4. Change Email Address

**Kullanım**: Email adresi değişikliği onayı

**Subject (Türkçe)**:
```
ServiceCareer - Email Adresinizi Onaylayın
```

**Message Body (Türkçe HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Değişikliği</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 700;">ServiceCareer</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">Email Adresinizi Onaylayın</h2>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ServiceCareer hesabınızın email adresi değiştirildi. Yeni email adresinizi onaylamanız gerekmektedir.
              </p>

              <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Değişikliği onaylamak için aşağıdaki butona tıklayın:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Email Adresimi Onayla
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Veya aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                  ⚠️ Güvenlik Uyarısı
                </p>
                <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  Eğer bu değişikliği siz yapmadıysanız, lütfen derhal hesap güvenliğinizi kontrol edin ve şifrenizi değiştirin.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Bu email {{ .Email }} adresine gönderilmiştir.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2024 ServiceCareer. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 5. Invite User

**Kullanım**: Admin tarafından yeni kullanıcı daveti

**Subject (Türkçe)**:
```
ServiceCareer - Davetiniz
```

**Message Body (Türkçe HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kullanıcı Daveti</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 700;">ServiceCareer</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">ServiceCareer'e Davet Edildiniz!</h2>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ServiceCareer platformuna davet edildiniz. Hesabınızı oluşturmak ve platforma katılmak için lütfen aşağıdaki adımları takip edin.
              </p>

              <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hesabınızı aktive etmek için aşağıdaki butona tıklayın:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Hesabımı Oluştur
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Veya aşağıdaki linki tarayıcınıza kopyalayın:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Info Box -->
              <div style="margin-top: 32px; padding: 16px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
                <p style="margin: 0; color: #1d4ed8; font-size: 14px; font-weight: 600;">
                  📋 Sonraki Adımlar
                </p>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  <li>Linke tıklayarak hesabınızı aktive edin</li>
                  <li>Güvenli bir şifre oluşturun</li>
                  <li>Profilinizi tamamlayın</li>
                  <li>ServiceCareer'i keşfetmeye başlayın</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Bu email {{ .Email }} adresine gönderilmiştir.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2024 ServiceCareer. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Domain Doğrulama

Email deliverability'yi artırmak için domain doğrulaması kritik önemdedir.

### Resend Dashboard'da Domain Ekleme

1. [Resend Dashboard](https://resend.com/domains) → **Domains** → **Add Domain**
2. Domain adını girin: `servicecareer.com`
3. **Add Domain** butonuna tıklayın

### DNS Kayıtlarını Ekleme

Resend size 3 DNS kaydı verecektir:

#### 1. SPF Record (Sender Policy Framework)

```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com include:_spf.resend.com ~all
TTL: 3600
```

**Açıklama**: Hangi sunucuların sizin adınıza email gönderebileceğini belirler.

#### 2. DKIM Record (DomainKeys Identified Mail)

```
Type: TXT
Name: resend._domainkey
Value: [Resend tarafından sağlanan uzun hash değeri]
TTL: 3600
```

**Açıklama**: Email'in gerçekten sizin domain'inizden geldiğini doğrular.

#### 3. DMARC Record (Domain-based Message Authentication)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@servicecareer.com
TTL: 3600
```

**Açıklama**: SPF ve DKIM başarısız olursa ne yapılacağını belirler.

### DNS Kayıtlarını Ekleme (Örnek: Cloudflare)

1. Cloudflare Dashboard → **DNS** → **Records**
2. Her bir kayıt için:
   - **Add record** butonuna tıklayın
   - Type, Name, Value değerlerini girin
   - **Save** butonuna tıklayın
3. DNS propagation 10-60 dakika sürebilir

### Domain Doğrulaması Kontrolü

1. Resend Dashboard → **Domains** → `servicecareer.com`
2. **Verify DNS Records** butonuna tıklayın
3. Tüm kayıtlar yeşil ✅ işareti almalı

**Sorun olursa**:
- DNS propagation için 1-2 saat bekleyin
- DNS kayıtlarını [DNSChecker.org](https://dnschecker.org/) ile kontrol edin
- Kayıtların tam olarak kopyalandığından emin olun (boşluk, nokta vs.)

---

## Test Kontrol Listesi

Yapılandırma tamamlandıktan sonra aşağıdaki testleri yapın:

### ✅ Email Verification Test

1. Yeni bir test hesabı oluşturun: http://localhost:3000/kayit
2. Doğrulama email'i geldi mi? ✅
3. Email doğru Türkçe mi? ✅
4. Link çalışıyor mu? ✅
5. Hesap aktif oldu mu? ✅

### ✅ Password Reset Test

1. Şifremi unuttum sayfasına gidin: http://localhost:3000/sifremi-unuttum
2. Email adresinizi girin
3. Sıfırlama email'i geldi mi? ✅
4. Email doğru Türkçe mi? ✅
5. Link çalışıyor mu? ✅
6. Yeni şifre ile giriş yapabildiniz mi? ✅

### ✅ Magic Link Test (Opsiyonel)

1. Magic link aktif mi kontrol edin
2. Magic link ile giriş deneyin
3. Email geldi mi? ✅
4. Link ile giriş başarılı mı? ✅

### ✅ Email Change Test

1. Hesap ayarlarından email değiştirin
2. Yeni email'e onay geldi mi? ✅
3. Onay linki çalışıyor mu? ✅

### ✅ Deliverability Test

Email'lerin spam kutusuna düşmediğinden emin olun:

1. **Gmail Test**: Gmail hesabına email gönderin
2. **Outlook Test**: Outlook hesabına email gönderin
3. **Spam Score**: [Mail-Tester.com](https://www.mail-tester.com/) ile test edin (hedef: 8+/10)

### ✅ Email Görünüm Testi

Farklı email istemcilerinde test edin:

- **Desktop**: Gmail, Outlook, Apple Mail
- **Mobile**: Gmail app, iOS Mail app
- **Dark Mode**: Hem light hem dark mode'da test edin

**Tool**: [Litmus](https://litmus.com/) veya [Email on Acid](https://www.emailonacid.com/) (opsiyonel)

---

## Sorun Giderme

### Sorun 1: Email Gönderilmiyor

**Belirtiler**:
- Doğrulama email'i gelmiyor
- Şifre sıfırlama email'i gelmiyor
- Hiç email almıyorsunuz

**Çözümler**:

1. **SMTP ayarlarını kontrol edin**:
   - Supabase Dashboard → Authentication → SMTP Settings
   - Username: `resend` (tam olarak bu şekilde)
   - Password: Resend API key (re_ ile başlamalı)
   - Port: 587

2. **Resend API key'i test edin**:
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "text": "Test message"
  }'
```

3. **Resend Dashboard logs kontrol edin**:
   - [Resend Logs](https://resend.com/logs)
   - Failed emails için error mesajları bakın

4. **Supabase email logs kontrol edin**:
   - Supabase Dashboard → Authentication → Logs
   - Email related error'ları arayın

---

### Sorun 2: Email Spam Kutusuna Düşüyor

**Belirtiler**:
- Email geliyor ama spam klasöründe
- Gmail/Outlook email'i güvenilmez buluyor

**Çözümler**:

1. **Domain doğrulaması tamamlandı mı?**
   - Resend Dashboard → Domains
   - Tüm DNS kayıtları ✅ olmalı

2. **SPF/DKIM/DMARC kontrol**:
```bash
# SPF kontrol
nslookup -type=txt servicecareer.com

# DKIM kontrol
nslookup -type=txt resend._domainkey.servicecareer.com

# DMARC kontrol
nslookup -type=txt _dmarc.servicecareer.com
```

3. **Email içeriği optimize edin**:
   - Spam trigger kelimeler: "ÜCRETSİZ", "KAZAN", "TIKLAYINIZ"
   - Çok fazla büyük harf kullanmayın
   - Image/text ratio dengeli olsun
   - Unsubscribe linki ekleyin (transactional emails için gerekli değil)

4. **Sender reputation**:
   - Yeni domain'ler düşük reputation'a sahiptir
   - İlk günlerde az email gönderin (warm-up period)
   - Spam şikayetlerini minimize edin

---

### Sorun 3: Email Template Variables Çalışmıyor

**Belirtiler**:
- `{{ .ConfirmationURL }}` template'de görünüyor
- Variables render edilmiyor

**Çözümler**:

1. **Supabase template syntax kullanın**:
```html
<!-- Doğru -->
{{ .ConfirmationURL }}
{{ .Email }}
{{ .Token }}

<!-- Yanlış -->
{ConfirmationURL}
{{ConfirmationURL}}
[ConfirmationURL]
```

2. **Whitespace'lere dikkat edin**:
```html
<!-- Doğru -->
{{ .ConfirmationURL }}

<!-- Yanlış -->
{{.ConfirmationURL}}
{{ .ConfirmationURL}}
```

3. **Template'i Save'leyin**:
   - Değişikliklerden sonra mutlaka **Save** butonuna tıklayın
   - Browser cache'i temizleyin ve tekrar deneyin

---

### Sorun 4: Email Çok Yavaş Geliyor

**Belirtiler**:
- Email 5-10 dakika sonra geliyor
- Bazen hiç gelmiyor

**Çözümler**:

1. **Email queue'yu kontrol edin**:
   - Resend Dashboard → Logs
   - `queued` status email'ler var mı?

2. **Rate limiting kontrol**:
   - Resend free plan: 100 email/day
   - Çok fazla email gönderdiniz mi?
   - [Rate limits](https://resend.com/docs/api-reference/introduction#rate-limit)

3. **Recipient email provider**:
   - Gmail'in kendi rate limiting'i var
   - Aynı email'e çok hızlı gönderiyorsanız block olabilir

4. **SMTP connection timeout**:
   - Port 587 yerine Port 2587 deneyin
   - Hosting/firewall port'u engelliyor olabilir

---

### Sorun 5: Turkish Characters Bozuk Görünüyor

**Belirtiler**:
- "İstanbul" → "Ä°stanbul"
- "Şifre" → "Åifre"
- Türkçe karakterler yanlış render ediliyor

**Çözümler**:

1. **Email template charset kontrol**:
```html
<!-- Template başına ekleyin -->
<meta charset="UTF-8">
```

2. **Supabase Dashboard encoding**:
   - Template'i copy-paste yaparken encoding bozulabilir
   - HTML entity kullanın:
     - İ → `&İ` veya `&#304;`
     - Ş → `&Ş` veya `&#350;`
     - Ğ → `&Ğ` veya `&#286;`

3. **Plain text version**:
   - HTML version'da sorun yoksa plain text'i kontrol edin
   - Plain text UTF-8 encoding destekliyor mu?

---

### Sorun 6: Email Link Çalışmıyor (404 Error)

**Belirtiler**:
- Email'deki link'e tıkladığınızda 404 error
- "Page not found" hatası

**Çözümler**:

1. **Site URL kontrol**:
```env
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production için
NEXT_PUBLIC_SITE_URL=https://servicecareer.com
```

2. **Supabase Site URL**:
   - Supabase Dashboard → Project Settings → General
   - **Site URL** production domain olmalı

3. **Redirect URLs**:
   - Supabase Dashboard → Authentication → URL Configuration
   - **Redirect URLs** listesine ekleyin:
     - http://localhost:3000/** (development)
     - https://servicecareer.com/** (production)

4. **Token expiration**:
   - Link expire olmuş olabilir
   - Yeni bir doğrulama/sıfırlama talebi gönderin

---

## Environment Variables

Gerekli environment variables ve kullanım alanları:

### Development (.env.local)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Resend Configuration (Custom emails için)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Optional: Email Overrides (Development)
NEXT_PUBLIC_EMAIL_FROM=noreply@servicecareer.com
NEXT_PUBLIC_EMAIL_REPLY_TO=support@servicecareer.com
```

### Production (.env.production)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration (CRITICAL: Production domain)
NEXT_PUBLIC_SITE_URL=https://servicecareer.com

# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Email Configuration
NEXT_PUBLIC_EMAIL_FROM=noreply@servicecareer.com
NEXT_PUBLIC_EMAIL_REPLY_TO=support@servicecareer.com

# Optional: Error Tracking
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

### Vercel Deployment

1. Vercel Dashboard → Project Settings → Environment Variables
2. Her bir variable'ı ekleyin:
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://servicecareer.com`
   - Environment: **Production** (Preview için farklı değerler kullanabilirsiniz)

---

## Deployment Checklist

Production'a çıkmadan önce kontrol listesi:

### 🔐 Security

- [ ] `SUPABASE_SERVICE_ROLE_KEY` güvenli bir yerde saklanıyor (Vercel env vars)
- [ ] `RESEND_API_KEY` güvenli bir yerde saklanıyor
- [ ] `.env.local` dosyası `.gitignore`'da
- [ ] Production API keys development'tan farklı

### 📧 Email Configuration

- [ ] Resend SMTP Supabase'de yapılandırıldı
- [ ] Domain doğrulandı (SPF, DKIM, DMARC)
- [ ] Email templates Türkçeleştirildi
- [ ] Test emails gönderildi ve teslim edildi
- [ ] Sender email verified domain kullanıyor

### 🌐 Site Configuration

- [ ] `NEXT_PUBLIC_SITE_URL` production domain olarak güncellendi
- [ ] Supabase Site URL production domain olarak güncellendi
- [ ] Redirect URLs production domain'i içeriyor
- [ ] SSL sertifikası aktif (https://)

### 🧪 Testing

- [ ] Email verification flow test edildi
- [ ] Password reset flow test edildi
- [ ] Magic link flow test edildi (eğer aktifse)
- [ ] Email change flow test edildi
- [ ] Spam score kontrol edildi (>8/10)
- [ ] Farklı email providers test edildi (Gmail, Outlook)
- [ ] Mobile email clients test edildi

### 📊 Monitoring

- [ ] Email delivery monitoring kuruldu (Resend Dashboard)
- [ ] Error tracking kuruldu (Sentry, LogRocket vs.)
- [ ] Email bounce rate takip ediliyor
- [ ] Spam complaint rate takip ediliyor

---

## Ek Kaynaklar

### Official Documentation

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase SMTP**: https://supabase.com/docs/guides/auth/auth-smtp
- **Resend Docs**: https://resend.com/docs
- **Resend SMTP**: https://resend.com/docs/send-with-smtp

### Email Deliverability Tools

- **DNS Checker**: https://dnschecker.org/
- **Mail Tester**: https://www.mail-tester.com/
- **MXToolbox**: https://mxtoolbox.com/
- **DMARC Analyzer**: https://dmarc.org/

### Email Testing Tools

- **Litmus**: https://litmus.com/ (Paid)
- **Email on Acid**: https://www.emailonacid.com/ (Paid)
- **Mailtrap**: https://mailtrap.io/ (Free tier)
- **Temp Mail**: https://temp-mail.org/ (Test için disposable emails)

### Turkish Email Best Practices

- **Formal vs Informal**: Formal dil kullanın ("siz" not "sen")
- **Clear CTA**: Action button'lar açık ve net olmalı
- **Privacy**: KVKK uyumluluğundan bahsedin
- **Support Contact**: Destek iletişim bilgileri ekleyin

---

## Destek

Sorun yaşarsanız:

1. **Supabase Discord**: https://discord.supabase.com/
2. **Resend Support**: support@resend.com
3. **ServiceCareer Team**: [İletişim bilgisi eklenecek]

---

**Son Güncelleme**: 2024-11-12
**Versiyon**: 1.0.0
**Yazar**: ServiceCareer DevOps Team
