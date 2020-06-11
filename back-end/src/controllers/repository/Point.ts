import knex from '../../database/connection'
import Knex from 'knex'

interface PointDefault{
  name: string,
  email: string,
  whatsapp: string,
  latitude: number,
  longitude: number,
  city: string,
  uf: string,
  image: string,
}
interface GetPointDefault extends PointDefault{
  id:number
}

class pointRepository{
  async getPointByCityUf(point_id:number[],city:string,uf:string){
    const points:GetPointDefault[] = await knex('points')
      .join('point_items','points.id', '=' , 'point_items.point_id')
      .whereIn('point_items.item_id', point_id)
      .where('city',String(city))
      .where('uf',String(uf))
      .distinct()
      .select('points.*')
    
    const serializedPoints = points.map(point=>{
      return {
        ...point,
        image_url: `http://192.168.1.77:3333/uploads/images/${point.image}`
      }
    })
    return serializedPoints
  }
  async getPoint(point_id: number){
    const point:GetPointDefault = await knex('points').where('id',point_id).first()

    const serializedPoints = {
        ...point,
        image_url: `http://192.168.1.77:3333/uploads/images/${point.image}`
    }

    return serializedPoints
  }
  async getPointItems(point_id: number):Promise<number[]>{
    const items = await knex('items')
      .join('point_items','items.id', '=','point_items.item_id' )
      .where("point_items.point_id", point_id)
      .select('items.title')
    return items
  }
  async create(point:PointDefault,items:number[]){
    const databasePoint = this._toDatabasePoint(point)
    const trx = await knex.transaction()
    const insertedIds = await trx('points').insert(databasePoint)
    const point_id = insertedIds[0]
    const databasePointItems = this._toDatabasePointItems(point_id,items)
    await trx('point_items').insert(databasePointItems)
    await trx.commit()
    return {
      id: point_id,
      ...point
    }
  }
  private _toDatabasePoint(point:PointDefault){
    return {
      name: point.name,
      email: point.email,
      whatsapp: point.whatsapp,
      latitude: point.latitude,
      longitude: point.longitude,
      city: point.city,
      uf: point.uf,
      image:point.image
    }
  }
  private _toDatabasePointItems(point_id:number,items:number[]){
    const pointItems = items.map((item_id:number)=>{
      return{
        item_id,
        point_id
      }
    })
    return pointItems
  }
}

export default pointRepository