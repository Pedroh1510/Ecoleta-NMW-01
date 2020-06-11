import express from 'express'

import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController'

import PointsValidators from "./validators/PointsValidators";

import PointMiddleware from './middleware/PointUpload'

const routes = express.Router()

const itemsController = new ItemsController()
const pointsController = new PointsController()

routes.get('/items',itemsController.index)
routes.get('/points', pointsController.index)

routes.get('/points/:id',pointsController.show)

routes.post('/points',PointMiddleware.upload,
  PointsValidators.create,
  pointsController.create)


export default routes