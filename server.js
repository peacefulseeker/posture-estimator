const express = require('express');
const next = require('next');
const nextI18NextMiddleware = require('next-i18next/middleware').default;

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const port = process.env.PORT || 8111;
const nextI18next = require('./i18n');

app.prepare().then(async() => {
    const server = express();

    await nextI18next.initPromise;
    server.use(nextI18NextMiddleware(nextI18next));
    server.use(app.getRequestHandler());
    await server.listen(port);
    console.log(`> Server ready on http://localhost:${port}`);
});
