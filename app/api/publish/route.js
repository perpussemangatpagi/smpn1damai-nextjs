import { NextResponse } from 'next/server';

export async function POST(req) {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // Pastikan nama repo ini bener
  
  try {
    const bodyPayload = await req.json();
    const { username, password, title, body, images, updateSha, updatePath, oldImage, imageToDelete, date } = bodyPayload;
    
    const usersList = JSON.parse(process.env.CMS_USERS || '[]');
    const user = usersList.find(u => u.user === username && u.pass === password);
    if (!user) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    let finalImagePath = oldImage || '';
    let appendedImagesMarkdown = ''; // 🔥 Penampung foto tambahan

    // Logika hapus foto lama (kalau diganti)
    if (imageToDelete) {
       try {
          const fileReq = await fetch(`https://api.github.com/repos/${repo}/contents/${imageToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
          if (fileReq.ok) {
             const fileData = await fileReq.json();
             await fetch(`https://api.github.com/repos/${repo}/contents/${imageToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Hapus foto lama oleh admin', sha: fileData.sha, branch: 'main' })
             });
          }
          if (finalImagePath === imageToDelete) finalImagePath = '';
       } catch(e) {}
    }

    // 🔥 LOGIKA UPLOAD MULTI FOTO
    if (images && images.length > 0) {
       for(let i = 0; i < images.length; i++) {
           const img = images[i];
           const imgName = `content/gambar/${Date.now()}-${img.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
           const base64Data = img.base64.split(',')[1];
           
           const imgReq = await fetch(`https://api.github.com/repos/${repo}/contents/${imgName}`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'Upload foto dokumentasi', content: base64Data, branch: 'main' })
           });
           
           if (imgReq.ok) {
               if (i === 0) {
                   finalImagePath = `/${imgName}`; // Foto 1 jadi Cover
               } else {
                   appendedImagesMarkdown += `\n\n![Gambar Tambahan](/${imgName})`; // Foto 2 dst otomatis masuk ke dalam teks
               }
           }
       }
    }

    // Logika setting tanggal (bisa mundur ke masa lalu)
    const dateStr = date || new Date().toISOString().split('T')[0];
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filePath = updatePath || `content/berita/${dateStr}-${safeTitle}.md`;
    
    // Gabungin isi teks sama sisipan foto-foto tambahan
    const finalBody = body + appendedImagesMarkdown; 
    const markdownContent = `---\ntitle: "${title}"\nauthor: "${user.nama}"\ndate: "${dateStr}"\nthumbnail: "${finalImagePath}"\n---\n\n${finalBody}`;
    const encodedContent = Buffer.from(markdownContent, 'utf8').toString('base64');
    
    const payload = {
       message: updateSha ? `Update berita: ${title}` : `Publish berita baru: ${title}`,
       content: encodedContent,
       branch: 'main'
    };
    if (updateSha) payload.sha = updateSha;

    const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
       method: 'PUT',
       headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
       body: JSON.stringify(payload)
    });

    if (!saveRes.ok) throw new Error('Gagal menyimpan file Teks ke GitHub');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
