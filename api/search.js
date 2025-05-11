// api/search.js
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "query 파라미터가 필요합니다." });
    return;
  }

  const apiKey = process.env.SERPAPI_KEY;
  const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(q + " site:bunjang.co.kr")}&hl=ko&gl=kr&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}