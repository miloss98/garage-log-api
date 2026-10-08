import { db } from '../../lib/db'
import { notFound } from '../../lib/http-error'
import { getCarById } from '../cars/cars.service'
import { ServiceRecordInput } from './service-records.schema'

//get all service records of a car
export const getServiceRecords = async (userId: string, carId: string) => {
  // 404 if the car doesn't exist or belongs to someone else
  await getCarById(userId, carId)

  const serviceRecords = await db.serviceRecord.findMany({
    where: { car_id: carId },
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
  await getCarById(userId, carId)

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
      car: { user_id: userId },
    },
  })

  if (!serviceRecord) throw notFound('Service record')
  return serviceRecord
}

//update service record
export const updateServiceRecord = async (
  userId: string,
  carId: string,
  serviceId: string,
  serviceData: ServiceRecordInput,
) => {
  await getServiceRecordById(userId, carId, serviceId)

  const updatedServiceRecord = await db.serviceRecord.update({
    where: { id: serviceId },
    data: { ...serviceData },
  })
  return updatedServiceRecord
}

//delete service record
export const deleteServiceRecord = async (userId: string, carId: string, serviceId: string) => {
  const serviceRecord = await getServiceRecordById(userId, carId, serviceId)

  await db.serviceRecord.delete({ where: { id: serviceId } })
  return serviceRecord
}
