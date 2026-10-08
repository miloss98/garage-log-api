import { db } from '../../lib/db'
import { notFound } from '../../lib/http-error'
import { getCarById } from '../cars/cars.service'
import { ServiceRecordInput } from './service-records.schema'

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0]

// Logging a service at 152,000 km means the car has at least 152,000 km.
// One conditional UPDATE: only raises the mileage, never lowers it
// (entering old history won't roll the odometer back).
const raiseCarMileage = (tx: Tx, carId: string, mileage: number | null | undefined) => {
  if (mileage == null) return

  return tx.car.updateMany({
    where: { id: carId, OR: [{ mileage: null }, { mileage: { lt: mileage } }] },
    data: { mileage },
  })
}

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

  // Transaction: the record and the mileage update succeed or fail together
  return db.$transaction(async (tx) => {
    const newServiceRecord = await tx.serviceRecord.create({
      data: {
        ...serviceData,
        car_id: carId,
      },
    })
    await raiseCarMileage(tx, carId, serviceData.mileage_at_service)
    return newServiceRecord
  })
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

  return db.$transaction(async (tx) => {
    const updatedServiceRecord = await tx.serviceRecord.update({
      where: { id: serviceId },
      data: { ...serviceData },
    })
    await raiseCarMileage(tx, carId, serviceData.mileage_at_service)
    return updatedServiceRecord
  })
}

//delete service record
export const deleteServiceRecord = async (userId: string, carId: string, serviceId: string) => {
  const serviceRecord = await getServiceRecordById(userId, carId, serviceId)

  await db.serviceRecord.delete({ where: { id: serviceId } })
  return serviceRecord
}
