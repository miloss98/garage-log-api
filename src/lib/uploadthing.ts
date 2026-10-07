import { UTApi } from 'uploadthing/server'
import dotenv from 'dotenv'

dotenv.config()

// Reads UPLOADTHING_TOKEN from the environment automatically
export const utapi = new UTApi()
