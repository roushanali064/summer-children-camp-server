const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const {
    MongoClient,
    ServerApiVersion
} = require('mongodb');

// middle ware
app.use(cors());
app.use(express.json());


//apis

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do03a5n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const classesCollection = client.db('summerCampChildrenDb').collection('Classes');
        const userCollection = client.db('summerCampChildrenDb').collection('user');

        // user api

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            
            const filter = {
                email: email
            };
            const user = await userCollection.findOne(filter)
            res.send(user)
        })
        
        app.post('/user', async (req, res) => {
            const user = req.body.savedUser;
            const filter = {
                email: user.email
            };
             const checkUser = await userCollection.findOne(filter);
             if (checkUser) {
                 return res.send('user already saved')
             }
             const result = await userCollection.insertOne(user);
             res.send(result)
        })

        // instructor api
        app.get('/instructor', async (req, res) => {
            const filter = {
                role: 'instructor'
            };
            const result = await userCollection.find(filter).sort({
                students: -1
            }).toArray();
            res.send(result)
        })

        // classes api

        app.get('/classes', async (req, res) => {
            const filter = {
                status: 'approved'
            }
            const result = await classesCollection.find(filter).sort({
                enrolled: -1
            }).toArray();
            res.send(result)
        })

        app.get('/myclasses/:email', async (req,res)=>{
            const email = req.params.email;
            const filter ={
                email: email
            }
            const result = await classesCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/manageclasses', async (req,res)=>{
            const filter = {
                email: { $exists: true }
            }
            const result = await classesCollection.find(filter).toArray();
            res.send(result)
        })

        app.post('/class', async (req,res)=>{
            const newClass = req.body?.newClass;
            
             const result = await classesCollection.insertOne(newClass);
             res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('the summer very hotter')
})

// app listen

app.listen(port, () => {
    console.log(`hotter summer on port ${port}`)
})