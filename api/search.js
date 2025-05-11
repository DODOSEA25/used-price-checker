// api/search.js
export default async function handler(req, res) {
  const { q } = req.query;

  // 1) 디버그 로그
  console.log('📥 query:', q);
  console.log('🔑 SERPAPI_KEY:', process.env.SERPAPI_KEY ? '✅ 설정됨' : '❌ 없음');

  if (!q) {
    console.log('⚠️ query 파라미터가 없음');
    return res.status(400).json({ error: 'query 파라미터가 필요합니다.' });
  }

  // ─── 여기가 핵심: apiKey 선언 ───
  const apiKey = process.env.SERPAPI_KEY;
  const apiUrl = `https://serpapi.com/search.json`
    + `?q=${encodeURIComponent(q)}`
    + `&hl=ko&gl=kr`
    + `&api_key=${apiKey}`;
  console.log('🌐 calling SerpAPI:', apiUrl);

  try {
    const response = await fetch(apiUrl);
    console.log('🛬 SerpAPI status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.log('💥 SerpAPI error body:', text);
      throw new Error(`SerpAPI HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ SerpAPI data keys:', Object.keys(data));
    return res.status(200).json(data);

  } catch (err) {
    console.error('🔥 handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
