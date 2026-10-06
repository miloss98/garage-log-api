import { Router } from 'express'

import {
  addCarController,
  deleteCarController,
  getCarByIdController,
  getCarsController,
  updateCarController,
} from './cars.controller'

const router = Router()

//get all cars
router.get('/', getCarsController)

//add new car
router.post('/', addCarController)

//get single car
router.get('/:id', getCarByIdController)

//update car
router.put('/:id', updateCarController)

//delete car
router.delete('/:id', deleteCarController)

export default router
