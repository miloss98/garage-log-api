import { db } from '../../lib/db'
import { ServiceRecordInput } from './service-records.schema'

//get all cars
export const getServiceRecords = async (userId: string, carId: string) => {
  const serviceRecords = await db.serviceRecord.findMany({
    where: {
      car_id: carId,
      car: {
        user_id: userId,
      },
    },
    orderBy: { service_date: 'desc' },
  })
  return serviceRecords
}

//add service record
export const addServiceRecord = async (
  userId: string,
  carId: string,
  serviceData: ServiceRecordInput,
) => {
  const car = await db.car.findFirst({ where: { id: carId, user_id: userId } })
  if (!car) throw new Error('Car not found')

  const newServiceRecord = await db.serviceRecord.create({
    data: {
      ...serviceData,
      car_id: carId,
    },
  })
  return newServiceRecord
}

//get single service record
export const getServiceRecordById = async (userId: string, carId: string, serviceId: string) => {
  const serviceRecord = await db.serviceRecord.findFirst({
    where: {
      id: serviceId,
      car_id: carId,
      car: {
        user_id: userId,
      },
    },
  })
  return serviceRecord
}

//update service record
export const updateServiceRecord = async (
  userId: string,
  carId: string,
  serviceId: string,
  serviceData: ServiceRecordInput,
) => {
  const serviceRecord = await db.serviceRecord.findFirst({
    where: {
      id: serviceId,
      car_id: carId,
      car: { user_id: userId },
    },
  })

  if (!serviceRecord) throw new Error('Service record not found')

  const updateServiceRecord = await db.serviceRecord.update({
    where: { id: serviceId },
    data: {
      ...serviceData,
    },
  })
  return updateServiceRecord
}

//delete service record
export const deleteServiceRecord = async (userId: string, carId: string, serviceId: string) => {
  const deletedServiceRecord = await db.serviceRecord.findFirst({
    where: {
      id: serviceId,
      car_id: carId,
      car: { user_id: userId },
    },
  })

  if (!deletedServiceRecord) throw new Error('Service record not found')

  await db.serviceRecord.delete({ where: { id: serviceId } })
  return deletedServiceRecord
}
