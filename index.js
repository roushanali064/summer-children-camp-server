const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
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
        const bookedClassesCollection = client.db('summerCampChildrenDb').collection('bookedClasses');
        const userCollection = client.db('summerCampChildrenDb').collection('user');
        const paymentsCollection = client.db('summerCampChildrenDb').collection('payments');

        // user api
        app.get('/users', async (req,res)=>{
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            
            const filter = {
                email: email
            };
            const user = await userCollection.findOne(filter)
            res.send(user)
        })
        
        app.put('/user/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const doc = req.body.role;
            const updateDoc = {
                $set: {
                  role: doc
                },
              };
            const result = await userCollection.updateOne(filter,updateDoc)
            res.send(result)

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

        app.patch('/update/seats/:id', async (req,res)=>{
            const id = req.params?.id;
            const filter = {
                _id: new ObjectId(id)
            }
            const doc = req.body;
            const updateDoc = {
                $set: {
                  availableSeats: doc?.availableSeats
                },
              };
            const result = await classesCollection.updateOne(filter,updateDoc)
            res.send(result)
        })

        // status approved api
        app.put('/status/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const doc = req.body.status;
            
             const updateDoc = {
                 $set: {
                   status: doc
                 },
               };
            const result = await classesCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        // status deny api
        app.put('/status/deny/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const doc = req.body.status;
            
             const updateDoc = {
                 $set: {
                   status: doc
                 },
               };
            const result = await classesCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        // feedback api
        app.patch('/feedback/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const doc = req.body.feedback;
            
             const updateDoc = {
                 $set: {
                    feedback: doc
                 },
               };
               
             const result = await classesCollection.updateOne(filter, updateDoc)
             res.send(result)
        })


        app.post('/class', async (req,res)=>{
            const newClass = req.body?.newClass;
            
             const result = await classesCollection.insertOne(newClass);
             res.send(result)
        })
        // bookClass Api

        app.post('/booked/class', async (req,res)=>{
            const data = req.body;
            const result = await bookedClassesCollection.insertOne(data);
            res.send(result)
        })

        app.get('/booked/class/:email', async (req,res)=>{
            const email = req.params?.email;
            const filter = {
                email: email
            }
            const result = await bookedClassesCollection.find(filter).toArray();
            res.send(result)
        })

        // booked class delete api
         app.delete('/booked/class/:id', async (req,res)=>{
            const id = req.params?.id;
            const filter = {
                _id: new ObjectId(id)
            }
            const result = await bookedClassesCollection.deleteOne(filter);
            res.send(result)
         })
        //  payment api
        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = price*100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
              });
              res.send({
                clientSecret: paymentIntent.client_secret
              });
        });

        // payment collection api
        app.get('/payments/:email', async (req,res)=>{
            const email = req.params?.email;
            const filter = {
                email: email
            }
            const result = await paymentsCollection.find(filter).toArray()
            res.send(result)
        })

        app.post('/payments', async (req,res)=>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment)
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