// Import the express framework for Node.js
const express = require('express')
// Initialize an express application
const app = express()
// Import MongoDB's MongoClient to interact with MongoDB database
const MongoClient = require('mongodb').MongoClient
// Set the default port for the server
const PORT = 2121
// Load environment variables from a .env file into process.env
require('dotenv').config()

// Declare variables to hold the database connection and configuration
let db,
    dbConnectionStr = process.env.DB_STRING, // Connection string for MongoDB, fetched from environment variables
    dbName = 'todo' // Name of the database

// Connect to MongoDB using the connection string
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        // Log success message once connected to the database
        console.log(`Connected to ${dbName} Database`)
        // Assign the specific database to the 'db' variable
        db = client.db(dbName)
    })
    
// Set EJS as the templating engine
app.set('view engine', 'ejs')
// Serve static files from the 'public' directory
app.use(express.static('public'))
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// Define the route for the root URL ('/') with an asynchronous function
app.get('/',async (request, response)=>{
    // Fetch all todo items from the database and convert to array
    const todoItems = await db.collection('todos').find().toArray()
    // Count the number of incomplete todo items
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    // Render the 'index.ejs' template, passing in todoItems and itemsLeft
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
})

// Define the route for adding a todo item, using POST request
app.post('/addTodo', (request, response) => {
    // Insert a new todo item into the database
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        // Log success message and redirect to root URL
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

// Define the route for marking a todo item as complete, using PUT request
app.put('/markComplete', (request, response) => {
    // Update the specified todo item to mark it as completed
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1}, // Sort by document ID in descending order
        upsert: false // Do not insert a new document if none match
    })
    .then(result => {
        // Log success message and respond with JSON
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// Define the route for marking a todo item as incomplete, using PUT request
app.put('/markUnComplete', (request, response) => {
    // Update the specified todo item to mark it as incomplete
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1}, // Sort by document ID in descending order
        upsert: false // Do not insert a new document if none match
    })
    .then(result => {
        // Log success message and respond with JSON
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// Define the route for deleting a todo item, using DELETE request
app.delete('/deleteItem', (request, response) => {
    // Delete the specified todo item from the database
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        // Log success message and respond with JSON
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

// Start the server on the specified port, or on PORT environment variable if defined
app.listen(process.env.PORT || PORT, ()=>{
    // Log the port number the server is running on
    console.log(`Server running on port ${PORT}`)
})
