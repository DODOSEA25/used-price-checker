// api/search.js
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: '검색어(q) 파라미터가 필요합니다.' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  const apiUrl =
    `https://serpapi.com/search.json` +
    `?q=${encodeURIComponent(q + ' 중고')}` +  // '중고' 자동 추가
    `&hl=ko&gl=kr&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const text = await response.text();
      console.error('SerpAPI error:', response.status, text);
      throw new Error(`SerpAPI HTTP ${response.status}`);
    }
    const data = await response.json();
    const results = data.organic_results || [];

    // 번개장터 개인 매물 링크만
    const items = results
      .filter(item => {
        try {
          const u = new URL(item.link);
          return (
            u.hostname.includes('bunjang.co.kr') &&
            u.pathname.startsWith('/products/')
          );
        } catch {
          return false;
        }
      })
      .map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || ''
      }));

    // 가격 파싱 & 평균 계산
    const prices = items.reduce((arr, { title, snippet }) => {
      const text = `${title} ${snippet}`;
      const m = text.match(/([0-9,]+)\s*(만원|원)/);
      if (m) {
        let num = parseInt(m[1].replace(/,/g, ''), 10);
        if (m[2] === '만원') num *= 10000;
        arr.push(num);
      }
      return arr;
    }, []);

    const average =
      prices.length > 0
        ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null;

    return res.status(200).json({ average, items });
  } catch (err) {
    console.error('/api/search exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
