const port = 8080;
const express = require('express');

const app = express();

app.use(express.static('../public' + '/'));
app.listen(port, () => {
    console.log("Servidor corriendo en: http://localhost:" + port);
})