import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  addServiceRecord,
  deleteServiceRecord,
  getServiceRecordById,
  getServiceRecords,
  updateServiceRecord,
} from './service-records.service'
import { serviceRecordSchema } from './service-records.schema'

export const getServiceRecordsController = async (req: AuthRequest, res: Response) => {
  const serviceRecords = await getServiceRecords(req.userId!, req.params.carId as string)
  res.status(200).json({ serviceRecords })
}

export const addServiceRecordController = async (req: AuthRequest, res: Response) => {
  const data = serviceRecordSchema.parse(req.body)
  const newServiceRecord = await addServiceRecord(req.userId!, req.params.carId as string, data)
  res.status(201).json({ newServiceRecord })
}

export const getServiceRecordByIdController = async (req: AuthRequest, res: Response) => {
  const serviceRecord = await getServiceRecordById(
    req.userId!,
    req.params.carId as string,
    req.params.serviceId as string,
  )
  res.status(200).json({ serviceRecord })
}

export const updateServiceRecordController = async (req: AuthRequest, res: Response) => {
  const data = serviceRecordSchema.parse(req.body)
  const updatedServiceRecord = await updateServiceRecord(
    req.userId!,
    req.params.carId as string,
    req.params.serviceId as string,
    data,
  )
  res.status(200).json({ updatedServiceRecord })
}

export const deleteServiceRecordController = async (req: AuthRequest, res: Response) => {
  const deletedServiceRecord = await deleteServiceRecord(
    req.userId!,
    req.params.carId as string,
    req.params.serviceId as string,
  )
  res.status(200).json({ deletedServiceRecord })
}
