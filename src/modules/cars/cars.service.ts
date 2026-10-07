import { db } from '../../lib/db'
import { CarInput } from './cars.schema'

//get all cars
export const getCars = async (userId: string) => {
  const cars = await db.car.findMany({
    where: { user_id: userId },
    include: { service_records: true },
    orderBy: { created_at: 'desc' },
  })
  return cars
}

//add new car
export const addCar = async (data: CarInput, userId: string) => {
  const newCar = await db.car.create({
    data: {
      ...data,
      user_id: userId,
    },
  })
  return newCar
}

//get single car
export const getCarById = async (userId: string, carId: string) => {
  const car = await db.car.findFirst({
    where: {
      id: carId,
      user_id: userId,
    },
  })
  return car
}

//update car
export const updateCar = async (userId: string, carId: string, carData: CarInput) => {
  const car = await db.car.findFirst({
    where: { id: carId, user_id: userId },
  })

  if (!car) throw new Error('Car not found')

  const updatedCar = await db.car.update({
    where: {
      id: carId,
    },
    data: {
      ...carData,
    },
  })

  return updatedCar
}

//delete car
export const deleteCar = async (userId: string, carId: string) => {
  const car = await db.car.findFirst({
    where: { id: carId, user_id: userId },
  })

  if (!car) throw new Error('Car not found')

  await db.car.delete({
    where: { id: carId },
  })

  return car
}
