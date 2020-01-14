const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const port = process.env.PORT || 8111;

app.prepare().then(async() => {
    const server = express();

    server.use(app.getRequestHandler());
    server.get('/server_status', (req, res) => res.sendStatus(200));
    await server.listen(port);
    console.log(`> Server ready on http://localhost:${port}`);
});
