//Apos isso criamos em scrips no package.json um start, e usando o npm start o nosso servidor começa a rodar na porta 3333 no nosso terminal observamos isso
// apos instalaçao do nodemon agora usamos npm run dev para iniciar nosso servidor 

require('express-async-errors')
const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const uploadConfig = require('./configs/upload')

const cors = require('cors')
const express = require('express')
const routes = require('./routes')

migrationsRun()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes)

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  console.error(error)

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

const PORT = 3333
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))