import sharp from 'sharp';
import cloudinary from '../utils/cloudinary.js';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';





export const addNewPost = async (req, res) => {
   try {
      const { option } = req.body;
      const image = req.body;
      const authorId = req.id;
      if (!image) {
         return res.status(400).json({
            message: 'image required ',
            success: false,
         })
      }
      // image upload 
      const optimizedImageBuffer = await sharp(image.buffer)
         .resize({ width: 800, height: 800, fit: 'inside' })
         .toFormat('jpeg', { quality: 80 }).toBuffer();

      // buffet to data uri
      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
      const coundresponse = await cloudinary.uploader.upload(fileUri);
      const post = await Post.create({
         caption,
         image: coundresponse.secure_url,
         author: authorId,
      })

      const user = await User.findById(authorId);
      if (user) {
         user.posts.push(post._id);
         await user.save();
      }
      await post.populate({ path: 'author', select: '-password' });
      return res.status(200).json({
         message: "new post create successfully",
         success: true,
      })
   } catch (error) {
      console.log(error);
   }
}


export const getallPost = async (req, res) => {
   try {
      const posts = await Post.find().sort({ createdAt: -1 })
         .populate({ path: 'author', select: 'username,profilePicture' })
         .populate({
            path: "comments",
            sort: { createdAt: -1 },
            populate: {
               path: 'author', select: 'username,profilepicture'
            },
         })
      return res.status(200).json({
         posts,
         success: true,
      })

   } catch (error) {
      console.log(error);

   }
}

export const getUserPost = async (req, res) => {
   try {
      const authorId = req.id;
      const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
         path: 'author',
         select: "username,password",
      }).populate({
         path: "comments",
         sort: { createdAt: -1 },
         populate: {
            path: 'author',
            select: 'username,profilepicture'
         },
      })
      return res.status(200).json({
         posts,
         success: true,
      })
   } catch (error) {
      console.log(error);
   }
}

export const linkePost = async (req, res) => {
   try {
      const likekrnewalakiId = req.id;
      const postId = req.params.id;
      const post = await Post.findById(postId);
      if (!post) {
         return res.status(401).json({
            message: "Post is not found ",
            success: false,
         })
      }
      // like logic 
      await Post.updateOne({ $addToSet: { likes: likekrnewalakiId } });
      await Post.save();

      // implement socket io for real time notificaton !!!!!!

      return res.status(200).jsong({
         message: 'Post liked ',
         success: true,
      })

   } catch (error) {
      console.log(error);

   }
}




export const dislinkePost = async (req, res) => {
   try {
      const likekrnewalakiId = req.id;
      const postId = req.params.id;
      const post = await Post.findById(postId);
      if (!post) {
         return res.status(401).json({
            message: "Post is not found ",
            success: false,
         })
      }
      // like logic 
      await Post.updateOne({ $pull: { likes: likekrnewalakiId } });
      await Post.save();

      // implement socket io for real time notificaton !!!!!!

      return res.status(200).jsong({
         message: 'Post  disliked ',
         success: true,
      })

   } catch (error) {
      console.log(error);

   }
}

export const addComment = async (req, res) => {
   try {
      const postId = req.params.id;
      const commentKrneWalaUserkiId = req.id;

      const { text } = req.body;
      const post = await Post.findById(postId);
      if (!text) {
         return res.status(401).json({
            message: "text is required ",
            success: false,
         })
      }

      const comment = await Comment.create({
         text,
         author: commentKrneWalaUserkiId,
         post: postId,
      }).populate({
         path: "author",
         select: 'username,profilePicture',
      })


      post.comments.push(comment._id);
      await post.save();

      return res.status(201).json({
         message: 'comment added',
         comment,
         success: true,
      })

   } catch (error) {
      console.log(error);

   }
}

export const getCommentsOfPost = async (req, res) => {
   try {
      const postId = req.params.id;
      const comments = await Comment.find({ post: postId }).populate('authr', 'username', 'profilePicture');
      if (!comments) {
         return res.status(404).json({
            message: 'No comments found of this post ! ',
            success: false,
         })
      }
      return res.status(201).json({
         success: true,
         comments,
      })

   } catch (error) {
      console.log(error);
   }
}

export const deletePost = async (req, res) => {
   try {
      const postId = req.params.id;
      const authorId = req.id;
      const post = await Post.findById(postId);
      if (!post) {
         return res.status(401).json({
            message: ' Post not found ',
            success: false,
         })
      }
      // check if the logged-in user is the owner of the post 
      if (post.author.toString() !== authorId) {
         return res.status(404).json({
            message: 'Unauthorized  user ',
            success: false,
         })
      }

      // delete the post 
      await Post.findByIdAndDelete(postId);

      // remove the post id  form the use psot 


      let user = await User.findById(authorId);
      user.posts = user.posts.filter(id => id.toString() !== postId);
      await user.save();

      // delete associated comments
      await Comment.deleteMany({ post: postId });

      return res.status(200).json({
         success: true,
         message: 'post deleted',
      })

   } catch (error) {
      console.log(error);

   }
}

export const bookMarkPost = async (req, res) => {
   try {
      const postId = req.params.id;
      const authorId = req.id;
      const post = await Post.findById(postId);
      if (!post) {
         return res.status(404).json({ message: 'Post not found ', success: false })
      }

      const user = await User.findById(authorId);
      if (user.bookmarks.includes(post._id)) {
         // alreday bookmarks --> remove form the bookmars 
         await user.updateOne({ $pull: { bookmarks: post._id } })
         await user.save();
         return res.status(200).json({
            type: 'unsaved',
            message: 'post remove from the bookmark ',
            success: true,
         })
      } else {
         // bookmark karna padega 
         await user.updateOne({ $addToSet: { bookmarks: post._id } })
         await user.save();
         return res.status(200).json({
            type: 'saved',
            message: 'post   bookmark ',
            success: true,
         })

      }


   } catch (error) {
      console.log(error);


   }
}