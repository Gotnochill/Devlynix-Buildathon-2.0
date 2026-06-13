require('dotenv').config();
const { createServer } = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets/scanSocket');

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
