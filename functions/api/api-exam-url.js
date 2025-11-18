/*
 * File: /functions/api/api-exam-url.js
 * API ini mengelola key 'EXAM_URL' di KV.
 */

// Menangani GET (Mengambil URL saat ini)
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const url = await env.EXAM_KV.get('EXAM_URL');
    return new Response(JSON.stringify({ url: url || '' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// Menangani POST (Menyimpan URL baru)
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { url } = await request.json();
    if (!url) {
      throw new Error('URL tidak boleh kosong');
    }
    
    // Simpan URL baru ke KV
    await env.EXAM_KV.put('EXAM_URL', url);
    
    return new Response(JSON.stringify({ success: true }));
    
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}