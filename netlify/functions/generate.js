exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No prompt' }) };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ text: data.content?.[0]?.text || '' }) };
  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'AI generation failed: ' + err.message }) };
  }
};
