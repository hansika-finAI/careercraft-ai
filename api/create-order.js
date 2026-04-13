export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { plan } = req.body;
    const amounts = { basic: 19900, pro: 49900 };
    const amount = amounts[plan] || amounts.pro;
    try {
          const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64');
          const response = await fetch('https://api.razorpay.com/v1/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth },
                  body: JSON.stringify({ amount, currency: 'INR', receipt: 'receipt_' + Date.now() })
          });
          const order = await response.json();
          return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
          return res.status(500).json({ error: 'Could not create payment order' });
    }
}
