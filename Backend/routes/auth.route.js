import express from 'express'
import { logout ,getMe,login,signup} from '../controllers/auth.contollers.js'
import protectRoute from '../middleware/protectRoute.js'

 const router=express.Router()
 router.post("/signup",signup)
 router.post("/login",login)
 router.post("/logout",logout)
 router.get("/me",protectRoute,getMe)

 export default router;