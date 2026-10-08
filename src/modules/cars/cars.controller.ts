import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { carSchema } from './cars.schema'
import { getCars, getCarById, addCar, updateCar, deleteCar } from './cars.service'

export const getCarsController = async (req: AuthRequest, res: Response) => {
  const cars = await getCars(req.userId!)
  res.status(200).json({ cars })
}

export const addCarController = async (req: AuthRequest, res: Response) => {
  const data = carSchema.parse(req.body)
  const newCar = await addCar(data, req.userId!)
  res.status(201).json({ newCar })
}

export const getCarByIdController = async (req: AuthRequest, res: Response) => {
  const car = await getCarById(req.userId!, req.params.id as string)
  res.status(200).json({ car })
}

export const updateCarController = async (req: AuthRequest, res: Response) => {
  const data = carSchema.parse(req.body)
  const car = await updateCar(req.userId!, req.params.id as string, data)
  res.status(200).json({ car })
}

export const deleteCarController = async (req: AuthRequest, res: Response) => {
  const deletedCar = await deleteCar(req.userId!, req.params.id as string)
  res.status(200).json({ deletedCar })
}
