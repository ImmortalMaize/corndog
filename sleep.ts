import env from "dotenv"
import fs from 'node:fs'
import path from 'node:path'

env.config()

console.log("Sleeping... -w-")

setTimeout(() => {}, 10)