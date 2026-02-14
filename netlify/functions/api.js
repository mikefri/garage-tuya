const express = require('express');
const serverless = require('serverless-http');
const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const app = express();
app.use(express.json());

const TUYA_ID = process.env.TUYA_ID;
const TUYA_SECRET = process.env.TUYA_SECRET;
const TUYA_REGION = process.env.TUYA_REGION || 'eu';
const DEVICE_ID = process.env.DEVICE_ID;

const getTuyaContext = () => {
  return new TuyaContext({
    baseUrl: `https://openapi.tuya${TUYA_REGION}.com`,
    accessKey: TUYA_ID,
    secretKey: TUYA_SECRET,
  });
};

const router = express.Router();

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

// --- C'EST ICI QUE CA CHANGE ---
// On dit à l'application d'écouter sur le chemin complet utilisé par Netlify
app.use('/.netlify/functions/api', router); 

module.exports.handler = serverless(app);
