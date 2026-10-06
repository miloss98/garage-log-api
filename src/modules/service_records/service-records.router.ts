import { Router } from 'express'

import {
  addServiceRecordController,
  deleteServiceRecordController,
  getServiceRecordByIdController,
  getServiceRecordsController,
  updateServiceRecordController,
} from './service-records.controller'

const router = Router({ mergeParams: true })

//get service records
router.get('/', getServiceRecordsController)

//add service record
router.post('/', addServiceRecordController)

//get single service record
router.get('/:serviceId', getServiceRecordByIdController)

//update service record
router.put('/:serviceId', updateServiceRecordController)

//delete service record
router.delete('/:serviceId', deleteServiceRecordController)

export default router
