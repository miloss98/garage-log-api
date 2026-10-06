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
  const userId = req.userId!
  const carId = req.params.carId as string

  try {
    const serviceRecords = await getServiceRecords(userId, carId)
    res.status(200).json({ serviceRecords })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addServiceRecordController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.carId as string
  const parsed = serviceRecordSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const newServiceRecord = await addServiceRecord(userId, carId, parsed.data)
    res.status(201).json({ newServiceRecord })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getServiceRecordByIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.carId as string
  const serviceId = req.params.serviceId as string

  try {
    const serviceRecord = await getServiceRecordById(userId, carId, serviceId)
    res.status(200).json({ serviceRecord })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateServiceRecordController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.carId as string
  const serviceId = req.params.serviceId as string
  const parsed = serviceRecordSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() })
    return
  }

  try {
    const updatedServiceRecord = await updateServiceRecord(userId, carId, serviceId, parsed.data)
    res.status(200).json({ updatedServiceRecord })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteServiceRecordController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const carId = req.params.carId as string
  const serviceId = req.params.serviceId as string

  try {
    const deletedServiceRecord = await deleteServiceRecord(userId, carId, serviceId)
    res.status(200).json({ deletedServiceRecord })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
