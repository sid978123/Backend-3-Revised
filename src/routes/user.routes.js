import express from "express";
import { Router } from "express";
import { regitsterUser } from "../controllers/authentication.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },

    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  regitsterUser
);

export default router;
