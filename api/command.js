const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const getTuyaContext = () => {
  const region = process.env.TUYA_REGION || 'eu';
  return new TuyaContext({
    baseUrl: `https://openapi.tuya${region}.com`,
    accessKey: process.env.TUYA_ID,
    secretKey: process.env.TUYA_SECRET,
  });
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, value } = req.body;

  if (!code || value === undefined) {
    return res.status(400).json({ error: 'code et value sont requis' });
  }

  try {
    const tuya = getTuyaContext();
    const data = await tuya.request({
      path: `/v1.0/iot-03/devices/${process.env.DEVICE_ID}/commands`,
      method: 'POST',
      body: {
        commands: [{ code, value }],
      },
    });
    res.json(data);
  } catch (error) {
    console.error('Erreur Tuya Command:', error);
    res.status(500).json({ error: 'Erreur commande', details: error.message });
  }
};
