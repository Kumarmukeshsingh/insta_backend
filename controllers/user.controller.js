import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";


export const getAllUser = async (req, res) => {
   const user = await User.find();
   if (!user) {
      res.status(404).json({ message: "Not found" })
   }
   res.status(200).json({ user, success: true })

}

export const register = async (req, res) => {
   try {
      const { username, email, password } = req.body;
      // console.log(username, email, password);

      if (!username || !email || !password) {
         return res.status(401).json({
            message: ' something is missing ,please check ',
            success: false,
         })
      }
      const user = await User.findOne({ email })
      if (user) {
         return res.status(402).json({
            message: "diffrent emial id",
            success: false,
         })
      }

      const hashpassword = await bcrypt.hash(password, 10);
      await User.create({
         username,
         email,
         password: hashpassword,

      })

      return res.status(201).json({
         message: " creater successfully",
         success: true,
      })

   } catch (error) {
      console.log(error);
   }

}


export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      // console.log(email, password);

      if (!email || !password) {
         return res.status(401).json({
            message: ' somthine is missing ,plesase check ',
            success: false,
         })
      }
      let user = await User.findOne({ email });
      if (!user) {
         return res.status(401).json({
            message: " Incorrect emial or password ",
            successd: false,
         })
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      // password = user give the password  and  user.password= database stored password 
      if (!isPasswordMatch) {
         return res.status(401).json({
            message: " Incorrect emial or password ",
            success: false,
         })
      }
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })
      // jwt.sing(user,secrit_key,expiry time)

      // populate each post  if in the aray
      const populatedPost = await Promise.all(user.posts.map(async (postId) => {
         const post = await Post.findById(postId);
         if (post.author.equals(user._id)) {
            return post
         }
         return null;
      }))
      user = {
         _id: user._id,
         username: user.username,
         email: user.email,
         profilePicture: user.profilePicture,
         bio: user.bio,
         followers: user.followers,
         following: user.following,
         posts: populatedPost,
      }

      return res.cookie("token", token, { httpOnly: true, sameSite: 'strict', MaxAge: 1 * 24 * 60 * 60 * 1000 }).json({
         message: `welcome back ${user.username}`,
         success: true,
         user,
         token,
      })
   } catch (error) {
      console.log(error);
   }
}

export const logout = (_, res) => {
   try {
      return res.cookie("token", "", { MaxAge: 0 }).json({
         message: "logout successfully ",
         success: true,
      })
   } catch (error) {
      console.log(error);
   }
}

export const getProfile = async (req, res) => {
   try {
      const userId = req.params.id;

      let user = await User.findById(userId).select("-password")
      return res.status(200).json({
         user,
         success: true,
      })
   } catch (error) {
      console.log(error);
   }
}

export const editPorfile = async (req, res) => {
   try {
      const userId = req.id;
      const { bio, gender } = req.body;
      const profilePicture = req.file;
      let cloudResponse;
      if (profilePicture) {
         const fileUri = getDataUri(profilePicture);
         cloudResponse = await cloudinary.uploader.upload(fileUri);
      }
      const user = await User.findById(userId);
      console.log(user)
      if (!user) {
         return res.status(404).json({
            message: "user not found ",
            success: false,
         })
      }
      if (bio) user.bio = bio;
      if (gender) user.gender = gender;
      if (profilePicture) user.profilePicture = cloudResponse.secure_url;
      await user.save();
      return res.status(200).json({
         message: " user updated successfully",
         success: true,
         user,
      })

   } catch (error) {
      console.log(error);

   }
}

export const getSuggestedUsers = async (req, res) => {
   try {
      const suggestedUser = await User.findOne({ _id: { $ne: req.id } }).select("-password");
      if (!suggestedUser) {
         return res.status(404).json({
            message: "currently do not have any users "
         })
      }
      return res.status(200).json({
         success: true,
         users: suggestedUser,
      })

   } catch (error) {
      console.log(erroe);

   }
}

export const followOrUnfollow = async (req, res) => {
   try {
      const followkrnewala = req.id; // me 
      const jiskoFollowKrunga = req.params.id;// other 
      if (followkrnewala === jiskoFollowKrunga) {
         return res.status(404).json({
            message: "you can not follow your self ",
            success: false,
         })
      }
      const user = await User.findById(followkrnewala);
      const targetUser = await User.findById(jiskoFollowKrunga);

      if (!user || !targetUser) {
         return res.status(404).json({
            message: "User not found  ",
            success: false,
         })
      }
      // check follow krna hai ya unfollow 
      const isFollowing = user.following.includes(jiskoFollowKrunga);
      console.log(isFollowing);
      if (isFollowing) {
         // unfollow logic
         await Promise.all([
            User.updateOne({ _id: followkrnewala }, { $poll: { following: jiskoFollowKrunga } }),
            User.updateOne({ _id: jiskoFollowKrunga }, { $poll: { followers: followkrnewala } })
         ])
         return res.status(200).json({
            message: "unfollow successfully", success: true
         })
      } else {
         // follow logic
         await Promise.all([
            User.updateOne({ _id: followkrnewala }, { $push: { following: jiskoFollowKrunga } }),
            User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followkrnewala } })
         ])
         return res.status(200).json({
            message: "follow successfully", success: true
         })
      }
   } catch (error) {
      console.log(error);
   }
}