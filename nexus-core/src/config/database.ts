import * as dotenv from 'dotenv'
import { Pool } from 'pg'
import Redis from 'ioredis'

dotenv.config()

export const db = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  keyPrefix: 'nexus:',
})
