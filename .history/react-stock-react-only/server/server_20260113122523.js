import { encryptetToken } from './auth.js'
import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const KSEF_URL = 'https://api-test.ksef.mf.gov.pl/v2'
