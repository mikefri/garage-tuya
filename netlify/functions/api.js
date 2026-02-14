const express = require('express');
const serverless = require('serverless-http');
const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const app = express();
app.use(express.json());

// Récupération des secrets depuis les variables Netlify
const TUYA_ID = process.env.TUYA_ID;
const TUYA_SECRET = process.env.TUYA_SECRET;
const TUYA_REGION = process.env.TUYA_REGION || 'eu';
const DEVICE_ID = process.env.DEVICE_ID;

// Initialisation context Tuya (à chaque appel car serverless)
const getTuyaContext = () => {
  return new TuyaContext({
    baseUrl: `https://openapi.tuya${TUYA_REGION}.com`,
    accessKey: TUYA_ID,
    secretKey: TUYA_SECRET,
  });
};

const router = express.Router();

// Route Statut
router.get('/status', async (req, res) => {
  try {
    const tuya = getTuyaContext();
    const data = await tuya.request({
      path: `/v1.0/iot-03/devices/${DEVICE_ID}/status`,
      method: 'GET',
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur Tuya', details: error.message });
  }
});

// Route Commande
router.post('/command', async (req, res) => {
  const { code, value } = req.body;
  try {
    const tuya = getTuyaContext();
    const data = await tuya.request({
      path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
      method: 'POST',
      body: {
        commands: [{ code: code, value: value }]
      }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur commande', details: error.message });
  }
});

// Utilisation du routeur
app.use('/', router);

module.exports.handler = serverless(app);
