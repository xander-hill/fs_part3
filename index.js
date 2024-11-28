const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())

app.use(express.json())

morgan.token('data', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
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

let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/phonebook', (request, response) => {
    response.json(phonebook)
})

app.get('/info', (request, response) => {
    const timestamp = new Date()

    response.send(`<div>
        <p>Phonebook has info for ${phonebook.length} people</p>
        <p>${timestamp}</p>
    </div>`)
})

app.get('/api/phonebook/:id', (request, response) => {
    const id = request.params.id
    const person = phonebook.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/phonebook/:id', (request, response) => {
    const id = request.params.id
    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return String(Math.floor(Math.random() * 100000))
}

app.post('/api/phonebook', (request, response) => {
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

    const entry = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    phonebook = phonebook.concat(entry)

    response.json(phonebook)
})
  
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
