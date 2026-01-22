import { createServer } from "node:http";
import { app } from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = createServer(app);

server.listen(port, () => {
  console.log(`MedHerbEMR API listening on http://localhost:${port}`);
});


