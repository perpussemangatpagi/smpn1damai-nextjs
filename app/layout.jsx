export const metadata = {
  title: 'SMPN 1 Damai | Official Website',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.',
  // 🔥 Racikan biar muncul Card Info pas di-share ke WA / Sosmed
  openGraph: {
    title: 'SMPN 1 Damai | Official Website',
    description: 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.',
    url: 'https://smpn1damai.web.id', // ganti pakai domain asli lu nanti
    siteName: 'SMPN 1 Damai',
    images: [
      {
        url: 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/logo_sekolah%20(1).png', // Link gambar thumbnail-nya
        width: 1200,
        height: 630,
        alt: 'Logo Resmi SMPN 1 Damai',
      },
    ],
    type: 'website',
  },
};
import './globals.css'

// Di sinilah KTP Google lu sekarang ditanam secara otomatis sama Next.js!
export const metadata = {
  title: 'SMP Negeri 1 Damai',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.',
  verification: {
    google: '4S6p9Q42VifIpP5fYTyuVVhnG-7prq52Ibtf1cdEObY',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" precedence="default" />
      </head>
      <body>
        {children} 
      </body>
    </html>
  )
}
