/*
 * File: /functions/api/token-manager.js
 * VERSI DIPERBARUI: Sekarang juga mengelola SYSTEM_STATUS
 */

// Menangani permintaan GET (Saat admin membuka halaman)
export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Ambil SEMUA data dari KV
    const token = await env.EXAM_KV.get('CURRENT_TOKEN');
    const mode = await env.EXAM_KV.get('TOKEN_MODE');
    const status = await env.EXAM_KV.get('SYSTEM_STATUS'); // BARIS BARU

    // Kirim data sebagai JSON
    return new Response(JSON.stringify({
      currentToken: token || '------',
      currentMode: mode || 'manual',
      currentStatus: status || 'inactive' // BARIS BARU (default 'inactive')
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
    const data = await request.json();

    // Periksa data apa yang dikirim
    if (data.newToken) {
      // Admin ingin mengatur token manual
      await env.EXAM_KV.put('CURRENT_TOKEN', data.newToken);
      await env.EXAM_KV.put('TOKEN_MODE', 'manual'); 
      
    } else if (data.newMode) {
      // Admin mengubah mode (auto/manual)
      await env.EXAM_KV.put('TOKEN_MODE', data.newMode);
      if (data.newMode === 'auto') {
        const newToken = Math.floor(100000 + Math.random() * 900000).toString();
        await env.EXAM_KV.put('CURRENT_TOKEN', newToken);
      }
      
    } else if (data.newStatus) { // BLOK BARU
      // Admin mengubah Status Sistem (Aktif/Tidak Aktif)
      await env.EXAM_KV.put('SYSTEM_STATUS', data.newStatus);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}