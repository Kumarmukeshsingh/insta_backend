import express from "express";
// import { editPorfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookMarkPost, deletePost, dislinkePost, getallPost, getCommentsOfPost, getUserPost, linkePost } from "../controllers/post.controller.js";


const router = express.Router();

router.route('/addpost').post(isAuthenticated, upload.single('image'), addNewPost);
router.route('/all').get(isAuthenticated, getallPost);
router.route('/userpost/all').get(isAuthenticated, getUserPost);
router.route('/:id/like').get(isAuthenticated, linkePost);
router.route('/:id/dislike').get(isAuthenticated, dislinkePost);
router.route('/:id/comment').post(isAuthenticated, addComment);
router.route('/:id/comment/all').get(isAuthenticated, getCommentsOfPost);
router.route('/delete/:id').post(isAuthenticated, deletePost);
router.route('/:id/bookmark').post(isAuthenticated, bookMarkPost);

export default router;