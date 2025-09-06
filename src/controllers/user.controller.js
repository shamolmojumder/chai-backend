import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation-empty filed
    //check if the user is already exist username|| email
    //check the image/avatar
    //upload them to cloudianry
    //create user object in db
    //remove password and refresh token
    // check for user creation
    //return res
    const { username, email, fullName, password } = req.body
    // console.log("req.body", req.body);

    // if (fullName == "") {
    //     throw new ApiError(400, "Fullname is required")
    // }
    if (
        [username, email, fullName, password].some((field) => field?.trim() === "")

    ) {
        throw new ApiError(400, "All filed are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log("req.files", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user register successfully",)
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation-empty filed
    // find the user from db
    //match the password
    // send cookies
    //return res
    const { email, username, password } = req.body;

    if (!email || !username) {
        throw new ApiError(400, "username & email is required ")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw ApiError(404, "User doesn't exist")
    }
})


export {
    registerUser,
    loginUser
};