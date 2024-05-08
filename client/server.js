import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 443;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'www_echolab_site.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'www_echolab_site.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'ssl', 'www_echolab_site.ca-bundle'))
};

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
