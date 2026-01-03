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
export { regitsterUser };
