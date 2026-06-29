import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Ngambil daftar user dari brankas Vercel
    const usersList = JSON.parse(process.env.CMS_USERS || '[]');
    const user = usersList.find(u => u.user === username && u.pass === password);
    
    if (user) {
      return NextResponse.json({ success: true, author: user.nama });
    } else {
      return NextResponse.json({ success: false, error: 'Username atau Password salah!' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
