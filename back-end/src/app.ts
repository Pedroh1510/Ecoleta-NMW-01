import express from 'express'
import path from 'path'
import cors from 'cors'
import routes from './routes'
import { errors } from "celebrate";

class App{
  constructor(){

    this.middlewares()
    this.routes()
    this.errorsValidators()
  }
  express = express()

  middlewares(){
    this.express.use(cors())
    this.express.use(express.json())
  }

  routes(){
    this.express.use('/uploads/items', express.static(path.resolve(__dirname,'..','uploads','items')))
    this.express.use('/uploads/images', express.static(path.resolve(__dirname,'..','uploads','images')))
    this.express.use(routes)
  }
  errorsValidators(){
    this.express.use(errors())
  }
}

export default new App().express