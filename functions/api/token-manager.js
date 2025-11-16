/*
 * File: /functions/api/token-manager.js
 * Ini adalah API untuk MENGATUR dan MENDAPATKAN token ujian.
 * Hanya bisa diakses oleh admin (karena sudah diamankan Cloudflare Access).
 */

// Menangani permintaan GET (Saat admin membuka halaman)
export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Ambil data dari KV
    const token = await env.EXAM_KV.get('CURRENT_TOKEN');
    const mode = await env.EXAM_KV.get('TOKEN_MODE');

    // Kirim data sebagai JSON
    return new Response(JSON.stringify({
      currentToken: token || '------', // Beri nilai default jika null
      currentMode: mode || 'manual'  // Mode default adalah manual
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// Menangani permintaan POST (Saat admin menyimpan perubahan)
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Ambil data JSON yang dikirim oleh admin
    const data = await request.json();

    // Periksa data apa yang dikirim
    if (data.newToken) {
      // Admin ingin mengatur token manual
      await env.EXAM_KV.put('CURRENT_TOKEN', data.newToken);
      await env.EXAM_KV.put('TOKEN_MODE', 'manual'); // Paksa mode jadi manual
    } else if (data.newMode) {
      // Admin mengubah mode (auto/manual)
      await env.EXAM_KV.put('TOKEN_MODE', data.newMode);

      // Jika pindah ke auto, langsung buat token baru
      if (data.newMode === 'auto') {
        const newToken = Math.floor(100000 + Math.random() * 900000).toString();
        await env.EXAM_KV.put('CURRENT_TOKEN', newToken);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}