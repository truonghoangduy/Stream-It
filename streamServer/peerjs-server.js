const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stream-it-d368f.firebaseio.com"

});

const { v4: uuidv4 } = require('uuid');

const { firestore } = require('firebase-admin');
const db = admin.firestore();
const auth = admin.auth();
const { PeerServer } = require('peer');

const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);

const peerServer = PeerServer({
    port: 9000,
    path: '/myapp',
    generateClientId: customGenerationFunction
});

peerServer.on('connection', (client) => {
    console.log(`Client connectwd : ${client.getId()}`)
})

async function delectRoom(path) {
    let roomRef = db.doc(path);
    let totoalCandidates = await roomRef.get();
    if (Object.keys(totoalCandidates.get("candidates")).length >= 1 ) {
        console.log("Do nothing");
    }else{
        console.log(`${totoalCandidates.data()}`)
       await roomRef.delete()
    }
}

peerServer.on('disconnect', async (client) => {
    let clientID = client.getId();
    console.log(`Client : ${clientID}`);
    let roomRef = db.collection("indexing").doc(clientID);
    let roomRefData = await roomRef.get();
    if (roomRefData.exists) {
        console.log(roomRefData.data());
        let removeClient = await db.doc(roomRefData.get("roomRef"));
        let specificclient = `candidates.${clientID}`
        await removeClient.update({
            [specificclient]: firestore.FieldValue.delete()
        })
        await roomRef.delete(); // indexing collection doc delelet
        console.log(`Remove peer : ${clientID} from Room : ${roomRef.path}`)

       await delectRoom(roomRefData.get("roomRef"))

    }
    else {
        console.log("Faile to remove client");
    }


    // let roomRef = await db.collection("indexing").doc(clientID)
})