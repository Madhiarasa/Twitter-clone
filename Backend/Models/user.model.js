import mongoose from "mongoose";

const UserSchema=mongoose.Schema({
    username:{
        type :String,
        require:true,
        unique:true
    },
    fullname:{
        type:String,
        require:true,
        unique:true
    },
    email:{
          type:String,
          require:true,
          unique:true
    },
    password:{
          type:String,
          require:true,
          minLength:6,
          unique:true
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],
    ProfileImg:{
        type:String,
        default:""
    },
    CoverImg:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:""
    },
    link:{
        type:String,
        default:""
    },
    likedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post",
            default:[]
        }
    ]

},{timestamps:true})

const User=mongoose.model("User",UserSchema)
 export default User;