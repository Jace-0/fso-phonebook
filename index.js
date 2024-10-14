const express = require('express')
const morgan = require('morgan')
const cors  = require('cors')
const Phone = require('./models/phone')

// Create an Express app
const app = express()
// Middleware that parse json body from POST request
app.use(express.json())
app.use(cors())

app.use(express.static('dist'))

// Use Morgan middleware with 'tiny' configuration for logging
// app.use(morgan('tiny'))

// Create a custom token to log request body
morgan.token('body', (request) => {
    return JSON.stringify(request.body) // Stringify the request body for logging
})

// Create a custom token called 'type' to log the content-type header
// morgan.token('type', (req, res) => {
//     return req.headers['content-type']
//   });

// Use Morgan with a format that includes the custom 'body' token
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body ')
  )

// let phonebook = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]
app.get('/api/persons', (request, response) => {
    Phone.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const requestTime = new Date().toString()

    Phone.countDocuments({})
        .then(count =>{
            response.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${requestTime}</p>
                `)
        })
})

app.get('/api/persons/:id', (request, response) => {
    // Extracts the 'id' parameter from the URL of the incoming request
    Phone.findById(request.params.id).then(person => {
        if (person){
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    // const person = phonebook.find(p => p.id === id)


})

// Handles DELETE requests to remove a note by its ID, filtering it out of the notes array and returning a 204 status
app.delete('/api/persons/:id', (request, response, next) => {
    Phone.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    // Creates a new array excluding the note with the matching id, then reassigns it to 'notes'
    // phonebook = phonebook.filter(person => person.id !== id) 

    // Sends a 204 (No Content) status code to indicate successful deletion
    // response.status(204).end()
})


const generateId = () => {
    const id = Math.floor(Math.random() * 1000000)
    return id.toString()
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person =  Phone({
        name : body.name,
        number : body.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
    // phonebook = phonebook.concat(person)
    // response.json(person)

        // if (!body.name) {
    //     return response.status(400).json({
    //         error: 'name missing'
    //     })
    // }

    // if (!body.number) {
    //     return response.status(400).json({
    //         error: 'number missing'
    //     })
    // }

    // if (phonebook.find(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

})


app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Phone.findByIdAndUpdate(request.params.id,
        {name, number},
        {new: true} )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
  }

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})