import { Request,Response, NextFunction } from 'express';
import multer from "multer";
import multerConfig from "../config/multer";

const upload = multer({
  storage:multerConfig.storege,
  fileFilter:multerConfig.fileFilter
}).single('image')
// const upload = multer().single('image')
  // ,
  // fileFilter:multerConfig.fileFilter

// const a = upload(res)

export default {
  upload:function(req:Request,res:Response,next:NextFunction){
    upload(req,res,function(err:any){
      if(err instanceof Error){
        return res.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:err.message,
          validation: {
            source: "body",
            keys: [
              "image",
            ]
          }
        })
      }
      return next()
    })
  }
};