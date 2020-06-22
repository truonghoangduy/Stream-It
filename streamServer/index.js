// // DB
// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');
// //initialize admin SDK using serciceAcountKey
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://stream-it-d368f.firebaseio.com"

// });

// const db = admin.firestore();
// const { v4: uuidv4 } = require('uuid');
// const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);

// // web app
// const express = require('express');
// const bodyParser = require('body-parser')
// var cors = require('cors')

// const { ExpressPeerServer } = require('peer');

// const app = express();
// const http = require('http');
// const { firestore } = require('firebase-admin');

// const server = http.createServer(app);

// const peerServer = ExpressPeerServer(server, {
//   debug: true,
//   path: '/myapp',
//   generateClientId:uuidv4()
// });

// app.use('/peerjs', peerServer);

// peerServer.on('disconnect',async (client)=>{
//   let clientID = client.getId();
//   console.log(`Client : ${clientID}`);
//   let roomRef = db.collection("indexing").doc(clientID);
//   let roomRefData = await roomRef.get();
//   if (roomRefData.exists) {
//     console.log(roomRefData.data());
//     let removeClient = await db.doc(roomRefData.get("roomRef"));
//     let specificclient = `candidates.${clientID}`
//     await removeClient.update({
//       [specificclient]:firestore.FieldValue.delete()
//     })
//     await roomRef.delete();
//     console.log(`Remove peer : ${clientID} from Room : ${roomRef.path}`)
//   }
//   else{
//     console.log("Faile to remove client");
//   }


//   // let roomRef = await db.collection("indexing").doc(clientID)
// })

// app.use(cors());
// app.use(bodyParser.json())
// app.get('/', (req, res, next) => res.send('Hello world!'));// == OR ==

// app.get("/test",async(req,res)=>{
//   let clientID = "rxg00ufwdvb00000";
//   let roomRef = db.collection("indexing").doc(clientID);
//   let roomRefData = await roomRef.get();
//   if (roomRefData.exists) {
//     console.log(roomRefData.data());
//     let removeClient = await db.doc(roomRefData.get("roomRef"));
//     let specificclient = `candidates.${clientID}`
//     await removeClient.update({
//       [specificclient]:firestore.FieldValue.delete()
//     })
//     await roomRef.delete();
//     res.send("OK");
//   }
//   else{
//     res.send("@@");
//   }


// })

// app.post('/removeRoom', async (req, res) => {
//   try {
//     console.log(req.body);
//     if (req.body != null) {
//       let path = req.body.path.toString();
//       let hostUUID = req.body.host;
//       let roomRef = db.doc(path);
//       let roomData = await roomRef.get()
//       if (roomData.exists) {
//         console.log("valid Room");
//         if (hostUUID == roomData.get("host")) {
//           roomRef.delete();
//           res.sendStatus(200).send();
//         }else{
//           res.sendStatus(401).send();
//         }
//       }else{
//         res.sendStatus(401).send();
//       }
//     }
//   } catch (error) {

//   }
// });

// app.post('/createRoom', async (req, res) => {
//   try {
//     console.log(req.body)
//     if (req.body != null) {
//       let roomConfig = req.body;
//       console.log(req.body)
//       let roomRef = await db.collection("rooms").add(
//         roomConfig
//       )
//       if ((await db.doc(roomRef.path).get()).exists) {
//         console.log("Room Exitetedsss");
//       }
//       res.send(roomRef.path);
//     } else {
//       res.send("fail");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// })

// server.listen(9000, () => {
//   console.log("http://localhost:9000")
// });

const fs = require('fs')
const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors')
const app = express();

app.get('/', (req, res, next) => res.send('Hello world!'));
const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
const http = require('http');

const credentail = 
  {
    key: fs.readFileSync('./domain.key'),
    cert: fs.readFileSync('./domain.crt')
  };

const server = http.createServer(
app);
const peerServer = ExpressPeerServer(server, {
  debug: true,
  // ssl: {
  //   key: fs.readFileSync('./domain.key'),
  //   cert: fs.readFileSync('./domain.crt')
  // },
  // path: '/myapp',
  generateClientId: customGenerationFunction
});
peerServer.on('disconnect', (client) => {
  console.log(`Discoonect : ${client.getId()}`)
})
app.use(cors());
app.use('/peerjs', peerServer);

server.listen(9000,"0.0.0.0");
// ipconfig getifaddr en0