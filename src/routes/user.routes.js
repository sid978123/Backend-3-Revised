import express from "express";
import { Router } from "express";
import { regitsterUser } from "../controllers/authentication.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/authentication.controller.js";
import { logoutUser } from "../controllers/authentication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
