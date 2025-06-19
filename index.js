import express from "express";
import { bootstrap } from "./src/index.controller.js";
import path from "path";
import { config } from "dotenv";
config({ path: path.resolve("src/config/.env") });
const app = express();
const port = process.env.PORT || 3000;

bootstrap(app, express);

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
