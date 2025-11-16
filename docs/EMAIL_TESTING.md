# Email Testing Guide

Comprehensive guide for testing email templates in ServiceCareer platform.

## Quick Start

```bash
# Start React Email dev server
npx react-email dev

# Access preview interface
# Browser opens at http://localhost:3001
```

## Testing Methods

### 1. React Email Dev Server (Recommended)

**Best for**: Template design, layout testing, responsive design

```bash
npx react-email dev
```

**Features**:
- Live preview at http://localhost:3001
- Hot reload on template changes
- Desktop and mobile view toggle
- Export HTML for testing in email clients
- No actual email sending (safe for development)

**Workflow**:
1. Start dev server: `npx react-email dev`
2. Edit templates in `/emails/` directory
3. Preview changes instantly in browser
4. Test responsive design with device toggle
5. Export HTML for email client testing

### 2. Email Preview Page (In-App)

**Best for**: Integration testing, actual email sending

Navigate to: `http://localhost:3000/email-preview`

**Features**:
- Visual preview of all 4 email templates
- Test actual email sending with real data
- Form to specify recipient email
- Success/error notifications
- Safe development environment

**WARNING**: This page should be removed before production deployment.

### 3. Manual Testing in Email Clients

**Best for**: Final verification before production

**Process**:
1. Use Email Preview Page to send test emails
2. Test in multiple email clients:
   - Gmail (web, iOS, Android)
   - Outlook (web, desktop)
   - Apple Mail (macOS, iOS)
   - Yahoo Mail
3. Verify rendering, links, and responsive design

## Email Template Test Scenarios

### 1. Welcome Email (`welcome-email.tsx`)

**Purpose**: Greet new users after successful registration

**Test Data**:
```typescript
{
  name: "Ali Yılmaz"
}
```

**Test Checklist**:
- [ ] Name personalization displays correctly
- [ ] Turkish characters render properly (İ, Ş, Ç, Ğ, Ü, Ö)
- [ ] "İlanları Görüntüle" button links to /ilanlar
- [ ] Button hover state works
- [ ] Logo displays correctly
- [ ] Footer links are functional
- [ ] Responsive design on mobile
- [ ] Email client compatibility (Gmail, Outlook, Apple Mail)

**Expected Behavior**:
- Subject: "ServiceCareer'a Hoş Geldiniz!"
- Warm, welcoming tone
- Clear call-to-action to browse jobs
- Professional design consistent with brand

---

### 2. Application Received Email (`application-received.tsx`)

**Purpose**: Confirm to candidates that their application was submitted

**Test Data**:
```typescript
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  companyName: "Starbucks"
}
```

**Test Checklist**:
- [ ] Candidate name personalization
- [ ] Job title displays correctly
- [ ] Company name displays correctly
- [ ] Status badge shows "Beklemede" (Pending)
- [ ] "Başvurum Görüntüle" button links to /dashboard
- [ ] Application details table renders properly
- [ ] Timeline of next steps is clear
- [ ] Responsive design on mobile

**Expected Behavior**:
- Subject: "Başvurunuz Alındı - {jobTitle}"
- Reassuring tone
- Clear status: "Beklemede"
- Next steps outlined
- Link to application dashboard

---

### 3. New Application Notification Email (`new-application.tsx`)

**Purpose**: Notify employers of new candidate applications

**Test Data**:
```typescript
{
  employerName: "Mehmet Demir",
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  applicationId: "123"
}
```

**Test Checklist**:
- [ ] Employer name personalization
- [ ] Candidate name displays correctly
- [ ] Job title displays correctly
- [ ] "Başvuruyu İncele" button links to /isveren/dashboard/basvurular/{applicationId}
- [ ] "Tüm Başvuruları Gör" button links to /isveren/dashboard/basvurular
- [ ] Urgency indicator (clock icon) displays
- [ ] Candidate information is clear
- [ ] Responsive design on mobile

**Expected Behavior**:
- Subject: "Yeni Başvuru - {candidateName} - {jobTitle}"
- Urgent, actionable tone
- Prominent call-to-action
- Quick access to review application
- Clear candidate and job information

---

### 4. Application Status Update Email (`application-status.tsx`)

**Purpose**: Inform candidates of application status changes

**Test All Status Variants**:

#### A. Pending Status
```typescript
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "pending" as const,
  companyName: "Starbucks",
  message: "Başvurunuz inceleniyor." // Optional
}
```

**Checklist**:
- [ ] Status badge: Yellow/Orange "Beklemede"
- [ ] Message tone: Patient, reassuring
- [ ] Next steps: Wait for review

#### B. Reviewing Status
```typescript
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "reviewing" as const,
  companyName: "Starbucks",
  message: "İşveren profilinizi inceliyor."
}
```

**Checklist**:
- [ ] Status badge: Blue "İnceleniyor"
- [ ] Message tone: Encouraging, active
- [ ] Next steps: Prepare for interview

#### C. Approved Status
```typescript
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "approved" as const,
  companyName: "Starbucks",
  message: "Tebrikler! İşveren sizinle görüşmek istiyor.",
  interviewDate: "15 Ocak 2025, Saat 14:00" // Optional
}
```

**Checklist**:
- [ ] Status badge: Green "Onaylandı"
- [ ] Message tone: Celebratory, congratulatory
- [ ] Interview date displays if provided
- [ ] Next steps: Contact information, preparation tips

#### D. Rejected Status
```typescript
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "rejected" as const,
  companyName: "Starbucks",
  message: "Maalesef bu sefer olmadı, ancak diğer fırsatlar için başvurmaya devam edin!"
}
```

**Checklist**:
- [ ] Status badge: Red "Reddedildi"
- [ ] Message tone: Empathetic, encouraging
- [ ] Next steps: Browse other opportunities
- [ ] Link to job listings

**Universal Checklist (All Status Variants)**:
- [ ] Candidate name personalization
- [ ] Job title displays correctly
- [ ] Company name displays correctly
- [ ] Status badge color matches status type
- [ ] Custom message displays if provided
- [ ] "Başvurum Görüntüle" button works
- [ ] "İlanları Görüntüle" button works
- [ ] Responsive design on mobile

---

## Sample Test Data Sets

### Complete Test Suite

```typescript
// Welcome Email
const welcomeData = {
  name: "Ali Yılmaz"
}

// Application Received
const applicationReceivedData = {
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  companyName: "Starbucks"
}

// New Application (Employer)
const newApplicationData = {
  employerName: "Mehmet Demir",
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  applicationId: "550e8400-e29b-41d4-a716-446655440000"
}

// Application Status - All Variants
const statusPending = {
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "pending" as const,
  companyName: "Starbucks",
  message: "Başvurunuz inceleniyor."
}

const statusReviewing = {
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "reviewing" as const,
  companyName: "Starbucks",
  message: "İşveren profilinizi inceliyor."
}

const statusApproved = {
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "approved" as const,
  companyName: "Starbucks",
  message: "Tebrikler! İşveren sizinle görüşmek istiyor.",
  interviewDate: "15 Ocak 2025, Saat 14:00"
}

const statusRejected = {
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "rejected" as const,
  companyName: "Starbucks",
  message: "Maalesef bu sefer olmadı, ancak diğer fırsatlar için başvurmaya devam edin!"
}
```

### Edge Cases to Test

```typescript
// Long names
{
  name: "Muhammed Ali Mehmet Yılmaz Demir"
}

// Special Turkish characters
{
  candidateName: "İsmail Çağlar Öztürk Şahin Ğül"
}

// Long job titles
{
  jobTitle: "Kıdemli Restoran Müdür Yardımcısı ve Operasyon Sorumlusu"
}

// Long company names
{
  companyName: "Uluslararası Restoran Zinciri ve Yiyecek İçecek Hizmetleri A.Ş."
}

// Very long custom messages
{
  message: "Başvurunuz için teşekkür ederiz. Maalesef bu pozisyon için uygun profilde olmadığınızı düşünüyoruz. Ancak gelecekte açılacak diğer pozisyonlar için kesinlikle değerlendireceğiz. Başarılar dileriz."
}

// Missing optional fields
{
  candidateName: "Ali Yılmaz",
  jobTitle: "Garson",
  status: "approved" as const,
  companyName: "Starbucks"
  // No message, no interviewDate
}
```

## Production Testing Strategy

### Pre-Production Checklist

**1. Template Validation**
- [ ] All 4 email templates render correctly
- [ ] No console errors in React Email dev server
- [ ] HTML exports validate (no broken markup)

**2. Data Integration**
- [ ] Email service connects to Resend API
- [ ] Environment variables configured correctly
- [ ] Error handling works (network failures, invalid data)

**3. Email Client Testing**
- [ ] Gmail (web, iOS, Android) - 70% market share
- [ ] Outlook (web, desktop) - 15% market share
- [ ] Apple Mail (macOS, iOS) - 10% market share
- [ ] Yahoo Mail - 3% market share
- [ ] Litmus or Email on Acid for automated testing

**4. Responsive Design**
- [ ] Mobile view (320px - 480px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (1024px+)

**5. Link Verification**
- [ ] All buttons link to correct routes
- [ ] Links work with production domain
- [ ] No localhost URLs in production

**6. Localization**
- [ ] Turkish characters render in all email clients
- [ ] Date/time formatting is Turkish locale
- [ ] No English text leaking through

**7. Performance**
- [ ] Email sending completes within 2 seconds
- [ ] No rate limiting issues with Resend
- [ ] Error notifications work properly

### Production Monitoring

**Email Delivery Metrics** (via Resend Dashboard):
- Delivery rate: Target >98%
- Open rate: Target >40% (industry average: 21%)
- Click-through rate: Target >15% (industry average: 2.6%)
- Bounce rate: Target <2%
- Spam complaint rate: Target <0.1%

**Error Monitoring**:
- Track failed email sends in application logs
- Alert on delivery failures
- Monitor Resend API response times

### Rollback Plan

If emails fail in production:
1. Check Resend API status
2. Verify environment variables
3. Test with sample data in production
4. Rollback to previous email service if critical
5. Contact Resend support if API issues

## Troubleshooting

### Common Issues

**Issue: Emails not sending**
- Check `RESEND_API_KEY` in environment variables
- Verify Resend account is active
- Check API rate limits
- Review application logs for errors

**Issue: Links not working**
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check route paths match Next.js routing
- Test links in production environment

**Issue: Images not displaying**
- Ensure logo is hosted on CDN or public URL
- Check image URLs are absolute, not relative
- Verify CORS settings for image hosting

**Issue: Turkish characters broken**
- Verify email encoding is UTF-8
- Check Resend API supports UTF-8
- Test in multiple email clients

**Issue: Layout broken in Outlook**
- Use table-based layouts (React Email handles this)
- Avoid flexbox and grid (limited support)
- Test in Outlook desktop specifically

## Development Workflow

### Recommended Process

1. **Design Phase**
   - Start React Email dev server: `npx react-email dev`
   - Edit templates in `/emails/` directory
   - Preview changes at http://localhost:3001
   - Iterate on design and layout

2. **Integration Phase**
   - Use Email Preview Page at `/email-preview`
   - Test with sample data
   - Verify links and buttons work
   - Check responsive design

3. **Testing Phase**
   - Send test emails to personal accounts
   - Test in Gmail, Outlook, Apple Mail
   - Verify on mobile devices
   - Check spam folder placement

4. **Production Phase**
   - Remove `/email-preview` page
   - Monitor Resend dashboard
   - Track delivery metrics
   - Respond to user feedback

## Additional Resources

- [React Email Documentation](https://react.email/docs/introduction)
- [Resend Documentation](https://resend.com/docs/introduction)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design-best-practices/)
- [Litmus Email Testing](https://www.litmus.com/)
- [Can I Email](https://www.caniemail.com/) - Email client support tables

## Support

For email-related issues:
- React Email: https://react.email/docs/introduction
- Resend Support: support@resend.com
- Resend Status: https://status.resend.com/
