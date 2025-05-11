// api/search.js

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: '검색어(q)가 필요합니다.' });
  }

  // 👉 여기가 바뀐 부분: api.bunjang.co.kr 사용
  const apiUrl =
    'https://api.bunjang.co.kr/api/1/find_v2.json' +
    `?keyword=${encodeURIComponent(q)}` +
    '&order=date' +
    '&start=0' +
    '&count=100';

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // data.list 에 매물 배열이 담겨 옴
    const rawList = Array.isArray(data.list) ? data.list : [];

    // 개인 매물(셀러 아님)만 걸러내기
    const personal = rawList.filter(item => !item.shop_member_no);

    // title, price, 링크만 뽑아서 구조 변경
    const items = personal.map(item => ({
      title: item.title,
      price: item.price,
      link: `https://m.bunjang.co.kr/products/${item.product_id}`
    }));

    // 평균 가격 계산
    const prices = items.map(i => i.price).filter(n => typeof n === 'number' && n > 0);
    const average = prices.length
      ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
      : null;

    return res.status(200).json({ average, items });
  } catch (err) {
    console.error('🍊 /api/search error:', err);
    return res.status(500).json({ error: err.message });
  }
}
