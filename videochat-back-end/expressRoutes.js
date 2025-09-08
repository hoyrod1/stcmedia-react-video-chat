// This is where all the routes for the web site will run
//--------------------------------------------------------------------//
// Create an instance of the express app from server.js
const app = require("./server").app;
//--------------------------------------------------------------------//

//--------------------------------------------------------------------//
const professionalAppointments = require("./professionalAppointments");
//--------------------------------------------------------------------//

//--------------------------------------------------------------------//
// require (JWT) Json Web Token
const jwt = require("jsonwebtoken");
const secretLink = "ihadhdfH283JWT";
//--------------------------------------------------------------------//

//--------------------------------------------------------------------//
app.set("professionalAppointments", professionalAppointments);
//--------------------------------------------------------------------//

//====================================================================//
//--------------------------------------------------------------------//
// This user route will be for CLIENT 1 to make a "offer"
// Calender/scheduling  APP will email this link to CLIENT 2
app.get("/user-link", (req, res) => {
  // const uuid = uuidv4(); //This represents a unique key from a database
  // personal data for the end-users with the appointment //
  const apptData = professionalAppointments[0];
  // res.setHeader("Access-Control-Allow-Origin", "*");

  professionalAppointments.push(apptData);

  // personal data needs to be encoded for the url //
  const token = jwt.sign(apptData, secretLink);
  res.send(`https://localhost:3000/join-video?token=${token}`);
  // Test response json output //
  // res.json("This is a test route");
});
//---------------------------------------------------------------------//
//=====================================================================//

//=====================================================================//
//---------------------------------------------------------------------//
app.post("/validate-link", (req, res) => {
  // Get the token from the body of the post request
  const token = req.body.token;
  // Decode the jwt with our secret (secretLink)
  const decodedData = jwt.verify(token, secretLink);
  // Send the decoded data back to the front end which will be a object
  res.json(decodedData);
  // console.log(professionalAppointments);
});
//---------------------------------------------------------------------//
//=====================================================================//

//====================================================================//
//--------------------------------------------------------------------//
app.get("/pro-link", (req, res) => {
  const userData = {
    fullName: "Rodney St. Cloud",
    proId: 1234,
  };
  // personal data needs to be encoded for the url //
  const token = jwt.sign(userData, secretLink);
  res.send(
    `<a href="https://localhost:3000/dashboard?token=${token}" target="_blank">Link Here</a>`
  );
});
//---------------------------------------------------------------------//
//=====================================================================//
