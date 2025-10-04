//------------------------------------------------------------------------//
// This generate unique keys for items for database entries
// like session IDs, or any data requiring a unique label
const { v4: uuidv4 } = require("uuid");
//------------------------------------------------------------------------//
//========================================================================//
const professionalAppointments = [
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 200000,
    uuid: 1,
    clientName: "IBM",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() - 400000,
    uuid: 2, // uuid:uuidv4(),
    clientName: "META",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 500000,
    uuid: 3, //uuid:uuidv4(),
    clientName: "Michelle Williams",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 6000000,
    uuid: 3, //uuid:uuidv4(),
    clientName: "Microsoft",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 700000,
    uuid: 4, //uuid:uuidv4(),
    clientName: "PerScholas",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 800000,
    uuid: 5,
    clientName: "Apple",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() - 900000,
    uuid: 6, // uuid:uuidv4(),
    clientName: "META",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 1000000,
    uuid: 7, //uuid:uuidv4(),
    clientName: "Perscholas",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 3000000,
    uuid: 8, //uuid:uuidv4(),
    clientName: "Chase Bank",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 4000000,
    uuid: 9, //uuid:uuidv4(),
    clientName: "GitHub",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 6000000,
    uuid: 10,
    clientName: "LinkedIn",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() - 8000000,
    uuid: 11, // uuid:uuidv4(),
    clientName: "Amazon",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 15500000,
    uuid: 12, //uuid:uuidv4(),
    clientName: "Private Equity inc",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 30000000,
    uuid: 13, //uuid:uuidv4(),
    clientName: "NYS Department Of Courts",
  },
  {
    professionalsFullName: "Rodney St. Cloud",
    apptDate: Date.now() + 354300000,
    uuid: 14, //uuid:uuidv4(),
    clientName: "Bodybuilding Forum",
  },
];
//========================================================================//

//========================================================================//
// const professionalAppointments = [
//   {
//     professionalsFullName: "Rodney St. Cloud",
//     apptDate: Date.now() + 500000,
//     uuid: 1, //uuid:uuidv4(),
//     clientName: "PerScholas",
//   },
//   {
//     professionalsFullName: "Rodney St. Cloud",
//     apptDate: Date.now() + 8000000,
//     uuid: 2, //uuid:uuidv4(),
//     clientName: "GitHub",
//   },
//   {
//     professionalsFullName: "Rodney St. Cloud",
//     apptDate: Date.now() + 9000000,
//     uuid: 3, //uuid:uuidv4(),
//     clientName: "Bodybuilding Forum",
//   },
// ];
//========================================================================//
module.exports = professionalAppointments;
