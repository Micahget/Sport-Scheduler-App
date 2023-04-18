/* eslint-disable  */
const express = require('express')
const app = express()

app.get('/', (request, response) => {
    response.send('Hello from Express!')
    })

app.listen(3000, () => {
    console.log('Server listening on port 3000')
    }
)

/*
* So the application that I want to build is called a sport scheduler. The general Idea is that we have a Many different we can add diffenert sports and in each sport we can add sessions. The sessions are , for example, a football game or a tennis match. And each session has a date and a time. And we can add players to each session. And we can also add a location to each session. And we can also add a coach to each session. And we can also add a referee to each session. And we can also add a team to each session... Lets start building it by simply by cli before we satrt doing it in the browser. now we have sequlizer for our database and other useful stuffes. we will build it accordingly */

// lets start by creating a new session for a sport 
app.post ('/session', (request, response) => {
    const session = request.body
    response.send(session)
    }
)

// lets display all the sessions
app.get('/session', (request, response) => {
    response.send('All sessions')
    }
)

// lets edit the sessions
app.put('/session/:id', (request, response) => {
    const id = request.params.id
    const session = request.body
    response.send(`Editing session: ${id} to be ${session}`)
    }
)

// lets delete the sessions
app.delete('/session/:id', (request, response) => {
    const id = request.params.id
    response.send(`Deleting session: ${id}`)
    }
)
