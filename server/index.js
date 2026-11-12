
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const jsonServer = require('json-server');
const { Server } = require('socket.io');

if (!fs.existsSync(path.join(__dirname, 'db.json'))) require('./seed')();

const database = jsonServer.create();
database.use(jsonServer.defaults({ logger: false, noCors: true }));
database.use(jsonServer.router(path.join(__dirname, 'db.json')));
database.listen(3001, '127.0.0.1', () => console.log('Database (json-server) running on port 3001'));

const app = express();
app.use(express.json());

app.use('/api/auth', require('./auth').router);
app.use('/api/requests', require('./requests'));
app.use('/api/volunteers', require('./volunteers'));
app.use('/api', require('./camps'));
app.use('/api', require('./stats'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const server = http.createServer(app);
const io = new Server(server);
app.set('io', io); 

server.listen(5000, () => console.log('ResQ API running on http://localhost:5000'));
