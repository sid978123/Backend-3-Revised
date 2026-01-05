// (registerUser, loginUser, logoutUser, refAccessToken, changeCurrentPassword);

import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/*steps 
 first  -> user will register with    Fullname , email , username , password , avatar , coverImage ,
 second -> value will be validate , wheather it is valid or not    
 third _> user will be checked if it is already exist or not 
 four _ > if it is not exist then new user is created 
 five ->  data is saved in the database  
 six -> afer this response is send to the user..

       */

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    if (!user) {
      throw new ApiError(401, "user not found");
    }
    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      404,
      error || "something went wrong while generating Access and Refresh Tokens"
    );
  }
};

const regitsterUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // validation check happen

  if (
    [fullName, username, email, password].some(
      (field) => typeof field != "string" || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required ");
  }

  //Now check user is already exist in DB or not

  const existedUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(401, "User is already exist");
  }

  const avatarLocalPath = await req.files?.avatar?.[0].path;
  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar field is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImageLocalPath = await req.files?.coverImage?.[0].path;
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const response = {
    _id: user._id,
    fullName,
    username: user.username,
    email: user.email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "User registered successfully"));
});

//login user controller ....

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  // if([ username,email , password].some((field) => field?.trim() = "" )){
  //   throw new ApiError(409 , "All fields are required ")
  // }

  if (!password || !(username || email)) {
    throw new ApiError(404, "All fields are required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(402, "Invalid Credentials , user not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  console.log("password from req:", password);
  console.log("hashed password:", user?.password);

  if (!isValidPassword) {
    throw new ApiError(402, "password is not valid");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = {
    _id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
  };

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    semeSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedInUser, "user loggedin successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized: req.user not set");
  }

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError("userId not found");
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: "" },
    },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "user loggedout successfully"));
});

export { regitsterUser, loginUser, logoutUser };
