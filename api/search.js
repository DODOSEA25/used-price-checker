// api/search.js

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res
      .status(400)
      .json({ error: '검색어(q) 파라미터가 필요합니다.' });
  }

  // 번개장터 검색 API: 최대 100개 매물 요청
  const apiUrl =
    'https://search.bunjang.co.kr/api/search.api' +
    `?q=${encodeURIComponent(q)}` +
    '&union=product' +
    '&start=0' +
    '&limit=100';

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const rawList = Array.isArray(data.list) ? data.list : [];

    // “shopMemberNo”가 있는 경우 공식 판매자 또는 셀러 게시물이므로 제외
    const personal = rawList.filter(item => {
      return !item.shopMemberNo;  // shopMemberNo가 0이거나 undefined인 개인 올린 글만
    });

    // 개인 매물만 title, price, link 형태로 정리
    const items = personal.map(item => ({
      title: item.title,
      price: item.price,  // 숫자
      link: `https://m.bunjang.co.kr/products/${item.product_id}`
    }));

    // 가격만 모아서 평균 계산
    const prices = items
      .map(i => i.price)
      .filter(n => typeof n === 'number' && n > 0);

    const average =
      prices.length > 0
        ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null;

    return res.status(200).json({
      average,
      items
    });

  } catch (err) {
    console.error('🍊 /api/search error:', err);
    return res
      .status(500)
      .json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
}
