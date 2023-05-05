/* eslint-disable  */
const express = require('express')
const app = express()
// const csrf = require('csurf')
var csrf = require("tiny-csrf");
const cookieParser = require('cookie-parser')
const { Sessions, User } = require('./models')
const bodyParser = require('body-parser')

// import authentication middlewares
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const LocalStrategy = require("passport-local").Strategy;

// password hashing
const bycrypt = require('bcrypt')
const saltRounds = 10



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

// here we are setting up sessions
app.use(
    session({
        secret: "my_super_secret_key-2345235234534534534",
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    })
);

// here we are setting up passport
app.use(passport.initialize());
app.use(passport.session());

// here we are setting up passport local strategy for the user
passport.use('user-local', new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({
                where: {
                    email: email,
                },
            });
            if (!user) {
                return done(null, false, { message: "Incorrect email." });
            }
            if (user.role !== "user") {
                return done(null, false, { message: "Incorrect email." });
            }
            // compare the the password with the hashed password
        const match = await bycrypt.compare(password, user.password)
        if (!match) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

// here we are setting up passport local strategy for the admin
passport.use('admin-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (user.role !== 'admin') {
            return done(null, false, { message: 'You are not authorized to access this page.' });
        }
        // compare the the password with the hashed password
        const match = await bycrypt.compare(password, user.password)
        if (!match) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// here we are serializing and deserializing the user
passport.serializeUser(function (user, done) {
    console.log("serializeUser", user.id)
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findByPk(id)
    .then((user) => {
      console.log("deserializing user in session ", user.id);
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});


// render the landing page
app.get("/", async (request, response) => {
    response.render("index", {
        title: "Sport Scheduler",
        csrfToken: request.csrfToken(),
    });
});

// *********************************SignUp and SignOut*********************************************
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

// this one is when the user want to signup
app.post("/users", async function (request, response) {
    // hash the password
    const hashedPad = await bycrypt.hash(request.body.password, saltRounds)
    const adminPassCode = 'admin'
    const adminPass = request.body.adminPass
    const role = adminPass === adminPassCode ? 'admin' : 'user'
    console.log("First Name", request.body.firstName)
    try {
        const user = await User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: hashedPad,
            role: role
        });
        request.login(user, (err) => {
            if (err) {
                console.log(err)
            }
            response.redirect('/scheduler')
        })
        // response.redirect('/scheduler')
    } catch (error) {
        console.log(error)
    }
});

//this one is when the user want to login
app.post("/session", (request, response, next) => {
    passport.authenticate("user-local", (err, user, info) => {
      if (err) return next(err);
      if (user) return request.logIn(user, (err) => {
        if (err) return next(err);
        return response.redirect("/scheduler");
      });
      passport.authenticate("admin-local", (err, admin, info) => {
        if (err) return next(err);
        if (admin) return request.logIn(admin, (err) => {
          if (err) return next(err);
          return response.redirect("/scheduler");
        });
        // redirecting the user to the login page if the user is not found
        return response.redirect("/login");
      })(request, response, next);
    })(request, response, next);
  });

  // creating logout route to render the login.ejs file
app.get("/signout", (request, response, next) => {
    request.logout((error) => {
      //logout is a method provided by passport
      if (error) {
        return next(error);
      }
      return response.redirect("/"); // redirect to the landing page
    });
  });
  
//**********************************************End of signup/ login*****************************************************

// render / with the index page and sessions together
app.get('/scheduler',
    connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        // use try catch to catch any errors

        const sessions = await Sessions.getEverySessions()
        const user = request.user
        // console.log(sessions)

        if (request.accepts('html')) {
            response.render('scheduler', {
                title: 'scheduler',
                sessions: sessions,
                user: user,
                csrfToken: request.csrfToken()
            })
        } else {
            response.json({
                sessions: sessions
            })
        }

    })

// render the newSession.ejs file
app.get('/newSession/:sport',
    connectEnsureLogin.ensureLoggedIn(), (request, response) => {
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
    // get the user Id of the session creator 
    const userId = request.user.id
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
            userId: userId
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
app.get('/sessionList',
    connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        const sessions = await Sessions.getEverySessions()
        // console.log(sessions)

        if (request.accepts('html')) {
            response.render('sessionList', {
                title: 'Sessions List',
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
app.get('/newSport',
    connectEnsureLogin.ensureLoggedIn(), (request, response) => {
        if (request.accepts('html')) {
            response.render('newSport', {
                title: 'newSport',
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
        return response.redirect('/scheduler')
    }
    catch (error) {
        console.log(error)
    }
})

// render the sport.ejs file with detail of sessions sports/name of sport from the database
app.get('/sports/:sport',
    connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        const sport = request.params.sport
        // get active Sessions of the sport
        const activeSession = await Sessions.getActiveSessions(sport)
        const passedSession = await Sessions.getPastSessions(sport)
        const user = request.user
        const userSession = await Sessions.getSessionsByUserId(user.id, sport)

        if (request.accepts('html')) {
            response.render('sports', {
                title: 'sports',
                sport: sport,
                activeSession: activeSession,
                passedSession: passedSession,
                User: user,
                userSession: userSession,
                csrfToken: request.csrfToken()
            })
        } else {
            response.json({
                sport: sport,
                activeSession: activeSession,
                passedSession: passedSession,
                User: user,
                userSession: userSession
            })
        }

    })

// lets render sport.ejs file with csrf token
app.get('/sports',
    connectEnsureLogin.ensureLoggedIn(), (request, response) => {
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
app.get('/updateSession/:sport/:id',
    connectEnsureLogin.ensureLoggedIn(), (request, response) => {
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
app.get('/sessionDetail/:id',
    connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        const id = request.params.id
        const session = await Sessions.getSessionById(id)
        const user = request.user
        console.log(id)
        if (request.accepts('html')) {
            response.render('sessionDetail', {
                title: 'sessionDetail',
                session: session,
                User: user,
                csrfToken: request.csrfToken()
            })
        } else {
            // if the request is not html, send a json response
            response.json({

            })
        }
    })

// update a session from the database by id 
app.put('/sessionDetail/:id/', async (request, response) => {
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