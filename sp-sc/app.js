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
    
        const sessions = await Sessions.getSessions()
        console.log(sessions)

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
app.get('/newSession', (request, response) => {
    response.render('newSession')
})



/*pp.get("/todos", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const userId = request.user.id;
  const overdue = await Todo.overdue(userId);
  const dueToday = await Todo.dueToday(userId);
  const dueLater = await Todo.dueLater(userId);
  const completedItem = await Todo.completedItem(userId);

  if (request.accepts("html")) {
    response.render("todos", {
      title: "Todo Application",
      overdue,
      dueToday,
      dueLater,
      completedItem,
    });
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      completedItem,
    });
  }
});*/
// taking the above code as a referece give me a get method to get all the sessions and render them in the sessions page
app.get('/sessions', async (request, response) => {
    // use try catch to catch any errors
    
        const sessions = await Sessions.getSessions()
        console.log(sessions)

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



// now when the user clicks on the submit button, we want to add the session to the database
app.post('/newSession', async (request, response) => {
    // use try catch to catch any errors
    try {
        const session = await Sessions.addSession({
            date: request.body.date,
            place: request.body.place,
            playerName: request.body.playerName,
            totalPlayers: request.body.totalPlayers,
            sport : request.body.sport,
        })
        console.log(session)
        // redirect to the sessions page
        return response.redirect('/')
    } catch (error) {
        console.log(error)
    }


})

// lets render sport.ejs file
app.get('/newSport', (request, response) => {
    response.render('newSport')
})

// get the respose from the sport.ejs file
app.post('/newSport', async (request, response) => {
    // get the value of the sport name
    const sportName = request.body.sport;
    console.log(sportName)
    response.send(`You selected ${sportName}`); // this will send the selected sport to the browser. to be exact it will send the selected sport to the sport.ejs file
})

// render the sport.ejs file with detail of sessions sports/name of sport from the database
app.get( '/sports/:sport' , async (request, response) => {
    // use try catch to catch any errors
    // get the param and send it with the response
    const sport = request.params.sport
    console.log(sport)

        const sessions = await Sessions.getSessions()
        console.log(sessions)

        if(request.accepts('html')){
            response.render('sports', {
                title: 'sports',
                sessions: sessions,
                sport: sport
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

module.exports = app