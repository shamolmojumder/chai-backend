import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation-empthy filed
    //check if the user is alredy exiits username|| email
    //check the image/avatar
    //upload them to cloudianry
    //create user object in db
    //remove password and refresh token
    // check for user creation
    //return res
    const { username, email, fullName, password } = req.body
    console.log(username, email, fullName, password);

    // if (fullName == "") {
    //     throw new ApiError(400, "Fullname is required")
    // }
    if (
        [username, email, fullName, password].some((field) => field?.trim() === "")

    ) {
        throw new ApiError(400, "All fileds are required")
    }

    const existindUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existindUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        new ApiResponse(200, createdUser)
    )

})




export {
    registerUser,
};