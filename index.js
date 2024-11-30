const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
require('dotenv').config()

app.use(cors())

app.use(express.json())

app.use(express.static('dist'))

morgan.token('data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const requestLogger = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.data(req, res)
  ].join(' ')
})

app.use(requestLogger)

app.get('/api/phonebook', (request, response) => {
  Person.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

app.get('/info', (request, response) => {
  const timestamp = new Date()

  Person.countDocuments({})
    .then(size => {
      response.send(`
                <div>
                    <p>Phonebook has info for ${size} people</p>
                    <p>${timestamp}</p>
                </div>
            `)
    })
})

app.get('/api/phonebook/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/phonebook/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/phonebook', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name and/or number missing'
    })
  } else if (phonebook.some(person => person.name === body.name)) {
    return response.status(409).json({
      error: 'number must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/phonebook/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log(error.message)
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
