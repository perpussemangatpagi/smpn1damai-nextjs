import './globals.css' // Manggil file CSS nanti

export const metadata = {
  title: 'SMP Negeri 1 Damai',
  description: 'Ekosistem Digital Cerdas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <nav>
           {/* Ini Navbar yang bakal muncul di SEMUA halaman */}
           <h2>Web SMPN 1 Damai</h2>
        </nav>
        
        {/* 'children' ini adalah isi konten yang ganti-ganti (Beranda, Profil, dll) */}
        {children} 
      </body>
    </html>
  )
}
