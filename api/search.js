// api/search.js

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res
      .status(400)
      .json({ error: '검색어(q) 파라미터가 필요합니다.' });
  }

  // 1) Bunjang “개인 매물” 전용 API 엔드포인트로 교체
  const keyword = encodeURIComponent(q);
  const apiUrl =
    'https://api.bunjang.co.kr/api/1/find_v2.json' +
    `?keyword=${keyword}` +
    '&order=date' +
    '&start=0' +
    '&count=100';

  try {
    const response = await fetch(apiUrl);
    const bodyText = await response.text();

    // 2) 에러 본문 로그 남기기
    if (!response.ok) {
      console.error('🍊 Bunjang API error:', response.status, bodyText);
      return res
        .status(500)
        .json({ error: `Bunjang API HTTP ${response.status}` });
    }

    const data = JSON.parse(bodyText);
    const rawList = Array.isArray(data.list) ? data.list : [];

    // 3) 개인 매물만 필터(shop_member_no가 없는 것)
    const personal = rawList.filter(item => !item.shop_member_no);

    // 4) title, price, link 구조로 정리
    const items = personal.map(item => ({
      title: item.title,
      price: item.price,
      link: `https://m.bunjang.co.kr/products/${item.product_id}`
    }));

    // 5) 평균 가격 계산
    const prices = items
      .map(i => i.price)
      .filter(n => typeof n === 'number' && n > 0);
    const average =
      prices.length > 0
        ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null;

    // 6) 최종 응답
    return res.status(200).json({ average, items });

  } catch (err) {
    console.error('🍊 /api/search exception:', err);
    return res
      .status(500)
      .json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
}
