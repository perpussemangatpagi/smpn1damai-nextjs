import './globals.css'

export const metadata = {
  title: 'SMP Negeri 1 Damai',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Ini buat manggil Ikon FontAwesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        {/* HEADER / NAVBAR UTAMA */}
        <header className="header-container glass">
            <div className="nav-brand">
                <div className="title">SMPN 1 Damai</div>
            </div>
        </header>

        {/* ISI HALAMAN BAKAL MUNCUL DI SINI */}
        {children} 
      </body>
    </html>
  )
}
