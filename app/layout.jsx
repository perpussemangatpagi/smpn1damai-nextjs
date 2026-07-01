import './globals.css'

// Di sinilah KTP Google lu sekarang ditanam secara otomatis sama Next.js!
export const metadata = {
  title: 'SMPN 1 Damai | Official Website',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.',
  
  // 🔥 Racikan biar muncul Card Info pas di-share ke WA / Sosmed
  openGraph: {
    title: 'SMPN 1 Damai | Official Website',
    description: 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.',
    url: 'https://smpn1damai.web.id', 
    siteName: 'SMPN 1 Damai',
    images: [
      {
        url: 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/logo_sekolah%20(1).png',
        width: 1200,
        height: 630,
        alt: 'Logo Resmi SMPN 1 Damai',
      },
    ],
    type: 'website',
  },
  verification: {
    google: '4S6p9Q42VifIpP5fYTyuVVhnG-7prq52IBtf1cdEObY',
  },
};

// 🔥 INI DIA FUNGSI UTAMA YANG HILANG DAN BIKIN VERCEL ERROR!
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* FontAwesome biar ikon kaca pembesar search & sosmed lu tetep nyala */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
