import './globals.css'

export const metadata = {
  title: 'SMP Negeri 1 Damai',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children} 
      </body>
    </html>
  )
}
