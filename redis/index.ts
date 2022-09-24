import { Client } from 'redis-om'

export default await new Client().open(process.env.REDIS_URL)