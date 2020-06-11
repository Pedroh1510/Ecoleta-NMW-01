import { Request } from 'express';
import multer from "multer";
import {FileFilterCallback, MulterError,ErrorCode} from "multer";
import path from "path";
import crypto from "crypto";

export default {
  storege: multer.diskStorage({
    destination:path.resolve(__dirname,'..','..','uploads','images'),
    filename(request,file,callback){
      const hash = crypto.randomBytes(8).toString('hex')

      const filename = `${hash}-${file.originalname}`

      callback(null, filename)
    }
  }),
  fileFilter: function fileFilter (request:Request, file: Express.Multer.File, callback:FileFilterCallback) {
    const typeFile = file.mimetype
    
    if( typeFile==='image/jpeg'||
        typeFile==='image/jpg' ||
        typeFile==='image/png'){
      callback(null, true)
    }else{
      callback(new Error('Image uploaded is not of type jpg/jpeg or png'))
    }
  }
}