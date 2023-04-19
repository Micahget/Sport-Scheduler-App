/* eslint-disable */
// now I am going to write a test to check if the new sessions are added to the database successfully
// before that I need to import important stuffes
const request = require('supertest')
const app = require('../app')
const db = require("../models/index");


describe("Sport Scheduler", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => { }); // we use differet port for testing to avoid conflicts
    agent = request.agent(server);
  });


  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  // test to create a new session
    test("Creates a new session and responds with json at /sessions POST endpoint", async () => {
        const response = await agent.post("/newSession").send({
            
            date: new Date().toISOString(),
            playerName: "John, Smith, Mike",
            place: "Gym",
            totalPlayers: 5
        });
        console.log("the details of the new session are: ", response.body);

        expect(response.statusCode).toBe(302); // here I am getting error 404 not found. lets fix it. I think the problem is with the route. lets fix it. To 
    });

// test to get all sessions
test("Gets all sessions and responds with json at /sessions GET endpoint", async () => {
    const response = await agent.get("/newSession");
    console.log("the details of the new session are: ", response.body);

    expect(response.statusCode).toBe(200);
    });

  
});
