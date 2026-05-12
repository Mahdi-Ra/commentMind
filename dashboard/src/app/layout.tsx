import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'CommentMind AI — داشبورد',
  description: 'مدیریت هوشمند کامنت‌های سایت با هوش مصنوعی',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
