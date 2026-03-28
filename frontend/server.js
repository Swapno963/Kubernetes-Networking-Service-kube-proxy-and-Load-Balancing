const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();
const PORT = 8080;

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-service:5000';

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(BACKEND_URL);
    const backendData = response.data;
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>K8s Networking Demo</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .info { 
            background: #e8f4f8; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 10px 0;
          }
          .label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Kubernetes Networking Demo</h1>
          <div class="info">
            <p><span class="label">Job Title:</span> ${backendData.job}</p>
            <p><span class="label">Backend Pod:</span> ${backendData.pod}</p>
            <p><span class="label">Backend Pod IP:</span> ${backendData.podIP}</p>
          </div>
          <div class="info">
            <p><span class="label">Frontend Pod:</span> ${os.hostname()}</p>
            <p><span class="label">Client IP:</span> ${req.ip}</p>
          </div>
          <button onclick="location.reload()">🔄 Refresh</button>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Error connecting to backend: ${error.message}`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${PORT}`);
  console.log(`Pod: ${os.hostname()}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});
