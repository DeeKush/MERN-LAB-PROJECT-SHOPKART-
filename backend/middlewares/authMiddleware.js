import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js'

export const isAuthenticated = async (req,res,next)=>{
    const token=req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"Not Authorized, Please Login"
        })
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET)

    const user=await Customer.findById(decoded.customerId)

    if(!user){
        return res.status(401).json({
            message:"Not Authorized, Please Login"
        })
    }

    req.user=user
    next()
}