const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]
}

const password = process.argv[2]

const url = `mongodb+srv://xanderkhill:${password}@cluster0.art4s.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    Person.find({}).then(result=> {
    result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
})
}

// Note.find({}).then(result=> {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })

if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]
    const person = new Person({
        name: newName,
        number: newNumber,
    })
    
    person.save().then(result => {
        console.log(`added "${newName}" number ${newNumber} to phonebook`)
        mongoose.connection.close()
    })
}