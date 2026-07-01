import './globals.css'

export const metadata = {
  title: 'SMP Negeri 1 Damai',
  description: 'Membentuk generasi unggul, beradab, dan melek teknologi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        {children} 
      </body>
    </html>
  )
}
