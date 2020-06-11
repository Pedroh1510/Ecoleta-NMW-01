import { Request, Response } from "express"
import PointRepository from './repository/Point'

interface requestBody{
  name:string
  email:string
  whatsapp:string
  latitude:number
  longitude:number
  city:string
  uf:string
  items:string
}

class PointsController{
  async index(req:Request,res:Response){
    const {city, uf, items} = req.query
    const parsedItems = String(items)
    .split(',')
    .map(item=>Number(item.trim()))
    
    const pointRepository = new PointRepository()

    const points = await pointRepository.getPointByCityUf(parsedItems,String(city),String(uf))

    return res.json(points)
  }
  async show(req:Request,res:Response){
    const {id} = req.params
    const pointRepository = new PointRepository()
    pointRepository.getPoint(Number(id))

    const point = await pointRepository.getPoint(Number(id))
    
    if(!point){
      return res.json({message:'point not found'})
    }

    const items = await pointRepository.getPointItems(Number(id))

    return res.json({point, items})
  }
  async create(req:Request,res:Response){
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body

    const point = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      image:req.file.filename
    }

    
    const pointRepository = new PointRepository()
    
    const newItems = items.split(',').map((item:string)=>Number(item.trim()))

    const {id} = await pointRepository.create(point,newItems)

    return res.json({
      id,
      ...point
    })
  }
}

export default PointsController