import User from "../Models/user.model.js"
import Post from "../Models/post.model.js";
import Notification from "../Models/notificationmodel.js";
import cloudinary from "cloudinary";

export const createPost =async(req,res)=>{
    try{
        const {text}=req.body;
        let{img}=req.body;
        const userId=req.user._id.toString();

        const user=await User.findOne({_id:userId})
        if(!user)
        {
            return res.status(400).json({error:"User not found"})
        }
        if(!text && !img)
        {
            return res.status(400).json({error:"Post must have Anythig"})
        }
        if(img)
        {
            const uploadedResponse=await cloudinary.uploader.upload(img);
            img=uploadedResponse.secure_url;
        }
        const newPost=new Post({
            user:userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);

    }
    catch(error)
    {
        console.log(`Error in created post:${error}`)
        res.status(500).json({error:"Internal error "})
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Not authorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId); 
        }

        await Post.findByIdAndDelete(id);

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(`Error in deletePost: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createcomment=async(req,res)=>{
    try{
       const {text}=req.body
       const postId=req.params.id
       const userId=req.user._id;
       if(!text)
       {
        return res.status(400).json({ error: "Comment text is required" });
       }
       const post=await Post.findOne({_id:postId})
       if(!post)
       {
       return res.status(404).json({ error: "Post not found" });
       }
       const comment={
        user:userId,
        text
       }
       post.comments.push(comment);
       await post.save();
       res.status(200).json(post);
    }
    catch (error) {
        console.log(`Error in deletePost: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const likeUnlikePost=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {id:postId}=req.params;
         const post=await Post.findOne({_id:postId})
       if(!post)
       {
       return res.status(404).json({ error: "Post not found" });
       }
       const userLikePost=post.likes.includes(userId)
       if(userLikePost)
       {
           await Post.updateOne({_id:postId},{$pull:{likes:userId}})
           await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
           const updatedLikes=post.likes.filter((id)=>id.toString()!==userId.toString())
           res.status(200).json(updatedLikes);
       }
       else{
           post.likes.push(userId)
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
           await post.save();
           const notification =new Notification({
            from:userId,
            to:post.user,
            type:"like"
           })
           await notification.save();
           const updatedLikes=post.likes;
           res.status(200).json(updatedLikes);
       }
    }
     catch (error) {
        console.log(`Error in like and unlike: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getAllPosts=async(req,res)=>{
    try{
       const posts =await Post.find().sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
       }).populate({
        path:"comments.user",
        select:["-password","-email","-following","-followers","-bio","-link"]
       })
       if(posts.length===0)
       {
        return res.status(200).json([])
       }
       res.status(200).json(posts)
    }
    catch(error)
    {
        console.log(`Error in get method: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getLikedPosts=async(req,res)=>{
    try{
        const userId=req.params.id;
        const user=await User.findOne({_id:userId})
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        const likedPosts=await Post.find({_id:{$in:user.likedPosts}}).populate({
        path:"user",
        select:"-password"
       }).populate({
        path:"comments.user",
        select:["-password","-email","-following","-followers","-bio","-link"]
       })
       res.status(200).json(likedPosts); 
    }
     catch(error)
    {
        console.log(`Error in getLikedPosts: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getFollowingPosts=async(req,res)=>{
    try{
        const userId=req.user._id;
        const user=await User.findById({_id:userId})
        if(!user)
        {
            return res.status(404).json({error:"user not found"})
        }
        const following=user.following;
        const feedPost=await Post.find({user:{$in:following}}).sort({createdAt:-1})
        .populate({
        path:"user",
        select:"-password"
       }).populate({
        path:"comments.user",
        select:["-password","-email","-following","-followers","-bio","-link"]
       })
       res.status(200).json(feedPost); 
    }
    catch (error) {
        console.log(`Error in  getFollowingPosts  ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserPost=async(req,res)=>{
    try{
          const {username}=req.params;
        const user=await User.findOne({username})
        if(!user)
        {
            return res.status(404).json({error:"user not found"})
        }
         const Posts=await Post.find({user:user._id}).sort({createdAt:-1})
        .populate({
        path:"user",
        select:"-password"
       }).populate({
        path:"comments.user",
        select:["-password","-email","-following","-followers","-bio","-link"]
       })
       res.status(200).json(Posts); 
    }
    catch (error) {
        console.log(`Error in  getFollowingPosts  ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}