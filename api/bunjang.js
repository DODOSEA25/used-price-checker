// api/bunjang.js
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: '검색어(q) 파라미터가 필요합니다.' });
  }

  // 번개장터 검색 API (가정)
  const apiUrl = `https://search.bunjang.co.kr/api/search.api`
    + `?q=${encodeURIComponent(q)}`
    + `&union=product`
    + `&start=0&limit=100`;  // 최대 100개까지 가져오기

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // data.list 배열에서 title, price, product_id, link 형태로 추출
    const items = (data.list || []).map(item => ({
      title: item.title,
      price: item.price,  // 숫자
      link: `https://ssl.bunjang.co.kr/products/${item.product_id}`
    }));

    // 평균값 계산
    const prices = items.map(i => i.price).filter(n => typeof n === 'number');
    const average = prices.length
      ? Math.floor(prices.reduce((a, b) => a + b) / prices.length)
      : null;

    return res.status(200).json({ average, items });
  } catch (err) {
    console.error('🍊 bunjang error:', err);
    return res.status(500).json({ error: err.message });
  }
}
