"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const app_js_1 = require("./app.js");
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = (0, node_http_1.createServer)(app_js_1.app);
server.listen(port, () => {
    console.log(`MedHerbEMR API listening on http://localhost:${port}`);
});
