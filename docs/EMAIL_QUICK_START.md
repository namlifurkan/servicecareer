# Email Testing - Quick Start Guide

Quick reference for testing emails in ServiceCareer.

## Development Testing (2 Methods)

### Method 1: React Email Dev Server (Recommended for Design)

```bash
npx react-email dev
```

- Opens preview at **http://localhost:3001**
- Live reload on template changes
- Test responsive design
- Export HTML for email client testing
- **No actual emails sent** (safe for design iteration)

### Method 2: Email Preview Page (Recommended for Integration)

Navigate to: **http://localhost:3000/email-preview**

- Visual preview of all 4 templates
- Send real test emails
- Tab navigation between email types
- Success/error notifications
- **⚠️ Remove before production!**

## 4 Email Templates

| Template | Trigger | Recipient |
|----------|---------|-----------|
| **Welcome** | User registration | New user |
| **Application Received** | Job application submitted | Candidate |
| **New Application** | Job application submitted | Employer |
| **Application Status** | Status change | Candidate |

## Quick Test Commands

```typescript
// In Email Preview Page - just click "Email Gönder" button
// Or programmatically:

// 1. Welcome Email
await sendWelcomeEmail('test@example.com', 'Ali Yılmaz')

// 2. Application Received
await sendApplicationReceivedEmail('test@example.com', {
  candidateName: 'Ali Yılmaz',
  jobTitle: 'Garson',
  companyName: 'Starbucks'
})

// 3. New Application (Employer)
await sendNewApplicationEmail('test@example.com', {
  employerName: 'Mehmet Demir',
  candidateName: 'Ali Yılmaz',
  jobTitle: 'Garson',
  applicationId: '123'
})

// 4. Application Status
await sendApplicationStatusEmail('test@example.com', {
  candidateName: 'Ali Yılmaz',
  jobTitle: 'Garson',
  status: 'approved', // pending | reviewing | approved | rejected
  companyName: 'Starbucks',
  message: 'Custom message',
  interviewDate: '15 Ocak 2025' // Optional
})
```

## Essential Checklist

**Before Testing**:
- [ ] `RESEND_API_KEY` set in `.env.local`
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly
- [ ] Dev server running (`npm run dev`)

**During Testing**:
- [ ] Turkish characters display correctly (İ, Ş, Ğ, Ü, Ö, Ç)
- [ ] All links work (buttons, footer)
- [ ] Responsive on mobile
- [ ] Status colors match (pending=yellow, approved=green, rejected=red)

**After Testing**:
- [ ] Test in Gmail, Outlook, Apple Mail
- [ ] Check spam folder
- [ ] Verify on mobile devices

## Pre-Production

Before deploying:
- [ ] Remove `/app/email-preview/page.tsx`
- [ ] Configure SMTP in Supabase Dashboard
- [ ] Update production URLs
- [ ] Test with production Resend API key

## Resources

- **Full Testing Guide**: `/docs/EMAIL_TESTING.md`
- **React Email Docs**: https://react.email/docs
- **Resend Docs**: https://resend.com/docs
- **Email Preview**: http://localhost:3000/email-preview
- **React Email Server**: http://localhost:3001

## Troubleshooting

**Emails not sending?**
→ Check `RESEND_API_KEY` in environment variables

**Links not working?**
→ Verify `NEXT_PUBLIC_SITE_URL` is correct

**Turkish characters broken?**
→ Email encoding should be UTF-8 (handled by React Email)

**Layout broken in Outlook?**
→ Use React Email dev server to test, avoid flexbox/grid

## Quick Commands

```bash
# Start dev server
npm run dev

# Start React Email preview
npx react-email dev

# Test in browser
open http://localhost:3000/email-preview

# Check environment
echo $RESEND_API_KEY
echo $NEXT_PUBLIC_SITE_URL
```

For detailed information, see `/docs/EMAIL_TESTING.md`
