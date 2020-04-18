const express = require('express');

const app = express();

app.get('/', (request, response) => {
    return response.json({
        descrição: 'Hello World',
        status: 'OK!'
    });
});

app.listen(3333);