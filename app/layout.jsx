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
