import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import Jwt from 'jsonwebtoken';

export const signup=async(req,res,next)=>{
    const {name,email,password,usertype}=req.body;
    const hashedPassword = bcryptjs.hashSync(password,10);
    const newUser=new User({name,email,password:hashedPassword,usertype});
    try{
        await newUser.save()
        res.status(201).json("User created successfully");
    } catch(error){
        next(error);
    }  
};

export const signin=async(req,res,next)=>{
    const {email,password}=req.body;
    try{
        const validUser=await User.findOne({email});
        if(!validUser) return next(errorHandler(404,'User not found!'));
        const validPassword=bcryptjs.compareSync(password,validUser.password);
        if(!validPassword) return next(errorHandler(404,'Invalid Password!'));
        const token=Jwt.sign({id:validUser._id},process.env.JWT_SECRET);
        const{password:pass, ...rest}=validUser._doc;
        res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);
    }catch(error){
       next(error); 
    }
}
export const google=async(req,res,next)=>{
    try{
        const user=await User.findOne({email:req.body.email})
        if(user){
            const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res
                .cookie('access_token', token, { httpOnly: true })
                .status(200)
                .json(rest);
        }
        else {
            const generatedPassword =
              Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
              name:req.body.name,
              email: req.body.email,
              password: hashedPassword,
              avatar: req.body.photo,
              usertype: req.body.usertype,
            });
            await newUser.save();
            const token = Jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            res
              .cookie('access_token', token, { httpOnly: true })
              .status(200)
              .json(rest);
        }
    }
    catch(error){
        next(error);
    }
}
export const signout =async(req,res,next)=>{
    try{
        res.clearCookie('access_token');
        res.status(200).json('User has been logged out!');
    }
    catch(error){
        next(error);
    }
}