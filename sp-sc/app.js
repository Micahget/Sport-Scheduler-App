/* eslint-disable  */
const express = require('express')
const app = express()
// const csrf = require('csurf')
var csrf = require("tiny-csrf");
const cookieParser = require('cookie-parser')
const { Sessions, User } = require('./models')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('shh! this is a secret'))
// app.use(csrf({ cookie: true })) // I do not need this because I am using cookie parser and I am passing the secret key to it
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));



const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views")); // this is the path to the views folder.
// set view engine
app.set('view engine', 'ejs')

// render the landing page
app.get("/", async (request, response) => {
    response.render("index", {
        title: "Sport Scheduler",
        csrfToken: request.csrfToken(),
    });
});

// ******************************************SignUp and SignOut****************************************************************************
// render the login page
app.get("/signup", function (request, response) {
    response.render("signup", {
        title: "Signup",
        csrfToken: request.csrfToken(),
    });
});

//   render the users page
app.get("/users", function (request, response) {
    response.render("signup", { title: "login", csrfToken: request.csrfToken() });
});
// render the login page
app.get("/login", function (request, response) {
    response.render("login", { title: "Login", csrfToken: request.csrfToken() }); // here the title is located in the login.ejs file
});
app.post("/users", async function (request, response) {
    console.log("First Name", request.body.firstName)
    try {
        const user = await User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: request.body.password,
            role: "admin"
        });
        response.redirect('/scheduler')
    } catch (error) {
        console.log(error)
    }
});
//****************************************************************************************************************************************************

// render / with the index page and sessions together
app.get('/scheduler', async (request, response) => {
    // use try catch to catch any errors

    const sessions = await Sessions.getEverySessions()
    // console.log(sessions)

    if (request.accepts('html')) {
        response.render('scheduler', {
            title: 'scheduler',
            sessions: sessions,
            csrfToken: request.csrfToken()
        })
    } else {
        response.json({
            sessions: sessions
        })
    }

})

// render the newSession.ejs file
app.get('/newSession/:sport', (request, response) => {
    const sport = request.params.sport
    console.log(sport)
    if (request.accepts('html')) {
        response.render('newSession', {
            title: 'newSession',
            sport: sport,
            csrfToken: request.csrfToken()
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
    if (count.length > request.body.totalPlayers) {
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
            sport: sport,
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

    if (request.accepts('html')) {
        response.render('sessions', {
            title: 'Sessions',
            sessions: sessions,
            csrfToken: request.csrfToken()

        })
    } else {
        response.json({
            sessions: sessions
        })
    }

})// sessions.ejs is getting rended but not getting the data from the database. lets fix it.  




// lets render sport.ejs file
app.get('/newSport', (request, response) => {
    if (request.accepts('html')) {
        response.render('newSport', {
            csrfToken: request.csrfToken()
        })
    } else {
        // if the request is not html, send a json response
        response.json({
        })
    }
})


// add new sport to the database
app.post('/newSport', async (request, response) => {
    // here we will add a row of sport to sports table
    try {
        const sport = await Sessions.addSession({
            sport: request.body.sport,
        })
        console.log(sport)
        return response.redirect('/')
    }
    catch (error) {
        console.log(error)
    }
})

// render the sport.ejs file with detail of sessions sports/name of sport from the database
app.get('/sports/:sport', async (request, response) => {
    const sport = request.params.sport
    // get active Sessions of the sport
    const activeSession = await Sessions.getActiveSessions(sport)
    const passedSession = await Sessions.getPastSessions(sport)

    if (request.accepts('html')) {
        response.render('sports', {
            title: 'sports',
            sport: sport,
            activeSession: activeSession,
            passedSession: passedSession,
            csrfToken: request.csrfToken()
        })
    } else {
        response.json({
            sessions: sessions
        })
    }

})

// lets render sport.ejs file with csrf token
app.get('/sports', (request, response) => {
    response.render('sports', { title: 'sports', csrfToken: request.csrfToken() })
})


//delete a sport from the database whcih will delete every session which have same sport name
app.delete('/', async (request, response) => {
    const sport = request.body.sport
    console.log(sport)
    try {
        const deleted = await Sessions.deleteSessionsBySport(sport)
        return response.json({ success: true });

    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
})

// delete a session from the database by id
app.delete('/sports/:id', async (request, response) => {
    const id = request.params.id

    try {
        const deleted = await Sessions.deleteSessionById(id)
        return response.json({ success: true });
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
})


// when updateSession is called, render the newSession page by its id for the sake of updating
app.get('/updateSession/:sport/:id', (request, response) => {
    const id = request.params.id
    const sport = request.params.sport
    if (request.accepts('html')) {
        response.render('updateSession', {
            title: 'updateSession',
            id: id,
            sport: sport,
            csrfToken: request.csrfToken()
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
app.post('/updateSession/:id', async (request, response) => {
    const { date, place, playerName, totalPlayers } = request.body
    const id = request.params.id
    const sport = request.body.sport

    try {
        const updated = await Sessions.updateSessionById(id, { date, place, playerName, totalPlayers, sport })
        return response.redirect(`/sessionDetail/${id}`)
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
})

// render the sessionDetail.ejs file with detail of sessions sports/name of sport from the database
app.get('/sessionDetail/:id', async (request, response) => {
    const id = request.params.id
    const session = await Sessions.getSessionById(id)
    console.log(id)
    if (request.accepts('html')) {
        response.render('sessionDetail', {
            title: 'sessionDetail',
            session: session,
            csrfToken: request.csrfToken()
        })
    } else {
        // if the request is not html, send a json response
        response.json({

        })
    }
})

// update a session from the database by id 
app.put('/session/:id/', async (request, response) => {
    const id = request.params.id
    const name = request.body.playerName
    console.log("updated naem: ", name)
    try {
        const updated = await Sessions.updatePlayerNameById(id, name)
        return response.json({ success: true });
    }
    catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
})


module.exports = app