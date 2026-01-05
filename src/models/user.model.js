import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Schema } from "mongoose";
import next from "next";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      tirm: true,
      lowerCase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      tirm: true,
      lowerCase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      unique: true,
      tirm: true,
    },

    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next;
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password) {
    throw new ApiError("Password not provided");
  }

  if (!this.password) {
    throw new ApiError("Hashed password missing from user document");
  }

  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessTokens = function () {
  return jwt.sign(
    {
      _id: this.id,
      fullName: this.fullName,
      usrname: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
