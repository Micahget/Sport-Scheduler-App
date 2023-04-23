/* eslint-disable  */
const express = require('express')
const app = express()
const { Sessions } = require('./models')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));


const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views")); // this is the path to the views folder. i need it 

/*
* So the application that I want to build is called a sport scheduler. The general Idea is that we have a Many different we can add diffenert sports and in each sport we can add sessions. The sessions are , for example, a football game or a tennis match. And each session has a date and a time. And we can add players to each session. And we can also add a location to each session. And we can also add a coach to each session. And we can also add a referee to each session. And we can also add a team to each session... Lets start building it by simply by cli before we satrt doing it in the browser. now we have sequlizer for our database and other useful stuffes. we will build it accordingly */

// set view engine
app.set('view engine', 'ejs')

// app.get('/', (request, response) => {
//     // render the index page
//     response.render('index', { title: 'Sport Scheduler' })
// })

// render / with the index page and sessions together
app.get('/', async (request, response) => {
    // use try catch to catch any errors
    
        const sessions = await Sessions.getEverySessions()
        // console.log(sessions)

        if(request.accepts('html')){
            response.render('index', {
                title: 'index',
                sessions: sessions,
            })
        } else {
            response.json({
                sessions: sessions
            })
        }
       
})

// when newSession is called, render the newSession page
app.get('/newSession/:sport', (request, response) => {
    const sport = request.params.sport
    console.log(sport)
        if(request.accepts('html')){
            response.render('newSession', {
                title: 'newSession',
                sport: sport,
            })
        } else {
            // if the request is not html, send a json response
            response.json({
                sport: sport
            })
        }
       
})


// now when the user clicks on the submit button, we want to add the session to the database
app.post('/newSession', async (request, response) => {
    const sport = request.body.sport
    const playerName = request.body.playerName
    const count = playerName.split(',')
    if(count.length > request.body.totalPlayers){
        // this console message will be replaced by a flash message
        console.log('you have entered more players than the total players')
        return response.redirect('/newSession/' + sport)
    }
    try {
        await Sessions.addSession({
            date: request.body.date,
            place: request.body.place,
            playerName: playerName,
            totalPlayers: request.body.totalPlayers,
            sport : sport,
        })
        // console.log(session)
        // redirect to the sessions page
        return response.redirect('/sports/' + sport)
    } catch (error) {
        
        console.log(error)
    }

// fivve india names: raj kumar, rahul, ravi, ramesh, rakesh
})



// taking the above code as a referece give me a get method to get all the sessions and render them in the sessions page
app.get('/sessions', async (request, response) => {
    // use try catch to catch any errors
    
        const sessions = await Sessions.getEverySessions()
        // console.log(sessions)

        if(request.accepts('html')){
            response.render('sessions', {
                title: 'Sessions',
                sessions: sessions,
            })
        } else {
            response.json({
                sessions: sessions
            })
        }
       
})// sessions.ejs is getting rended but not getting the data from the database. lets fix it.  




// lets render sport.ejs file
app.get('/newSport', (request, response) => {
    response.render('newSport')
})

// add new sport to the database
app.post('/newSport', async (request, response) => {
    // here we will add a row of sport to sports table
    try{
        const sport = await Sessions.addSession({
            sport: request.body.sport,
        })
        console.log(sport)
        return response.redirect('/')
    }
    catch(error){
        console.log(error)
    }
})

// render the sport.ejs file with detail of sessions sports/name of sport from the database
app.get( '/sports/:sport' , async (request, response) => {
    // use try catch to catch any errors
    // get the param and send it with the response
    const sport = request.params.sport
    console.log(sport)

        const sessions = await Sessions.getSessionsBySport(sport)
        // console.log(sessions)

        if(request.accepts('html')){
            response.render('sports', {
                title: 'sports',
                sessions: sessions,
                sport: sport,
            })
        } else {
            response.json({
                sessions: sessions
            })
        }
       
})    

// lets render sport.ejs file
app.get('/sports', (request, response) => {
    response.render('sports')
})

// app.delete("/todos/:id", async function (request, response) {
//     console.log("We have to delete a Todo with ID: ", request.params.id);
//     const userId = request.user.id;
//     // FILL IN YOUR CODE HERE
//     try {
//       await Todo.remove(request.params.id, userId);
//       return response.json({ success: true });
//     } catch (error) {
//       console.log(error);
//       return response.status(422).json(error);
//     }
//   });
//delete a sport from the database whcih will delete every session which have same sport name
app.delete( '/' , async (request, response) => {
    const sport = request.body.sport
    console.log(sport)
    try{
        const deleted = await Sessions.deleteSessionsBySport(sport)
        console.log("Deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeee", deleted)
        return response.json({ success: true });

    }
    catch(error){
        console.log(error);
        return response.status(422).json(error);
    }
})

// delete a session from the database by id
app.delete( '/sports/:id' , async (request, response) => {
    const id = request.params.id
    console.log("yeeeeeeeeeeeeeeeeeeeeeee", id)
    try{
        const deleted = await Sessions.deleteSessionById(id)
        console.log("Deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeee", deleted)
        return response.json({ success: true });

    }
    catch(error){
        console.log(error);
        return response.status(422).json(error);
    }
})



// when updateSession is called, render the newSession page by its id for the sake of updating
app.get('/updateSession/:sport/:id', (request, response) => {
    const id = request.params.id
    const sport = request.params.sport
    console.log("geaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaat")
    console.log(id)
        if(request.accepts('html')){
            response.render('updateSession', {
                title: 'updateSession',
                id: id,
                sport: sport,
            })
        } else {
            // if the request is not html, send a json response
            response.json({
                sport: sport,
                id: id
            })
        }
       
})


// update a session from the database by id
app.post('/updateSession/:id' , async (request, response) => {// the form has method put and action updateSession but I says cannot get / updateSession. why?  I am using put method in the form. To fix 
    console.log("Updateeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    const {date, place, playerName, totalPlayers} = request.body
    const id = request.params.id
    const sport = request.body.sport
    console.log("Updateeeeeeeeeeeeeeeeeeeeeeeeeeeeee", id)
    try{
        const updated = await Sessions.updateSessionById(id, {date, place, playerName, totalPlayers, sport})
        console.log("Updateeeeeeeeeeeeeeeeeeeeeeeeeeeeee", updated)
        return response.redirect(`/sports/${sport}`)
    }
    catch(error){
        console.log(error);
        return response.status(422).json(error);
    }
})

// render the sessionDetail.ejs file with detail of sessions sports/name of sport from the database
app.get('/sessionDetail/:id' , async (request, response) => {
    const id = request.params.id
    const session = await Sessions.getSessionById(id)
    // console.log("geaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaat")
    console.log(id)
        if(request.accepts('html')){
            response.render('sessionDetail', {
                title: 'sessionDetail',
                session: session,
            })
        } else {
            // if the request is not html, send a json response
            response.json({
                
            })
        }
    })

    // update a the name of player in the session by recivig id and name from url and add the name with comman to the player name and add it to the database
    app.put('/session/:id/' , async (request, response) => {
        const id = request.params.id
        const name = request.body.playerName
        console.log("updated naem: ", name)
        try {
            const updated = await Sessions.updatePlayerNameById(id, name)
            return response.json({ success: true });
        }
        catch(error){
            console.log(error);
            return response.status(422).json(error);
        }
    })


    




module.exports = app