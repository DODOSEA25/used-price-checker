// api/autocomplete.js
export default async function handler(req, res) {
  const { term } = req.query;
  if (!term) {
    return res.status(400).json({ error: "term 파라미터가 필요합니다." });
  }

  const apiKey = process.env.SERPAPI_KEY;
  const apiUrl = `https://serpapi.com/search.json`
    + `?engine=google_autocomplete`
    + `&q=${encodeURIComponent(term)}`
    + `&hl=ko&gl=kr`
    + `&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return res.status(200).json({ suggestions: data.suggestions || [] });
  } catch (err) {
    console.error("Autocomplete error:", err);
    return res.status(500).json({ error: err.message });
  }
}
