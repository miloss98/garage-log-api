import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { carSchema } from './cars.schema'
import { getCars, getCarById, addCar, updateCar, deleteCar } from './cars.service'

export const getCarsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!

  try {
    const cars = await getCars(userId)
    res.status(200).json({ cars })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addCarController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const parsed = carSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const newCar = await addCar(parsed.data, userId)
    res.status(201).json({ newCar })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getCarByIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.id as string

  try {
    const car = await getCarById(userId, carId)
    res.status(200).json({ car })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCarController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.id as string
  const parsed = carSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const car = await updateCar(userId, carId, parsed.data)
    res.status(200).json({ car })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteCarController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.id as string

  try {
    const deletedCar = await deleteCar(userId, carId)
    res.status(200).json({ deletedCar })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
