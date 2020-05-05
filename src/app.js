//app.js to export the app ready for integration testing

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const { NODE_ENV } = require('./config')
const foldersRouter = require('./folders/folders-router')
const notesRouter = require('./notes/notes-router')
const logger = require('./logger')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet()) //Make sure to place helmet before cors in the pipeline. 17.6
app.use(cors())


app.use(foldersRouter)
app.use(notesRouter)


app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    logger.error(error.message)
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})


module.exports = app