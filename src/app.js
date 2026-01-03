import express from "express";
import CookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extends: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(CookieParser());

import router from "../src/routes/user.routes.js";
app.use("/api/v1/users", router);

export { app };
