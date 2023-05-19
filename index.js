const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');
require('dotenv').config()

const app = express();

// middleware 
app.use(cors())
app.use(express.json())



const port = process.env.PORT || 5000;





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vxlatcb.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const toysCollections = client.db('toysDB').collection('allToys')

        app.post('/addToy' , async (req , res) =>{
            const toy = req.body;
            // console.log(toy)
            const result = await toysCollections.insertOne(toy)
            res.send(result)
        })

        app.get('/allToys' , async (req , res) =>{
            const cursor = toysCollections.find()
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/myToys/:email', async (req , res) =>{
            const email = req.params.email;
            console.log(email)
            let query = {};
            if(!email){
                return res.status(403).send({error:1 , message :'Unauthorize user'})
            }
            if(email){
                query= {sellerEmail: email}
            }
            const result = await toysCollections.find(query).sort({price: -1}).toArray();
            res.send(result)

        })

        const indexKeys = {name:1}
        const indexOptions= {name:'name'}
        const result = await toysCollections.createIndex(indexKeys , indexOptions)

        app.get('/allToys/:search' , async (req , res) =>{
            const searchText = req.params.search;

            const result = await toysCollections.find({
                $or: [
                    {name:{$regex :searchText , $options : 'i'}}
                ]
            }).toArray()

            res.send(result)

        })

        app.delete('/deleteToys/:id' , async (req , res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result =await toysCollections.deleteOne(query)
            res.send(result)
        })

        app.get('/toy/:id' ,async (req ,res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await toysCollections.findOne(query)
            res.send(result)
        })

        app.put('/update/:id' , async (req ,res) => {
            const id = req.params.id ;
            const newData = req.body;
            const filter = {_id: new ObjectId(id)};
            const updatedData = {
                $set: {
                    price:newData.price,
                    quantity:newData.quantity,
                    description: newData.description
                }
            }
            const result = await toysCollections.updateOne(filter , updatedData);
            res.send(result)
        })

        app.get('/details/:id' , async (req , res) =>{
            const id = req.params.id ;
            const query = {_id: new ObjectId(id)}
            const result = await toysCollections.findOne(query);
            res.send(result)
        })

        app.get('/categories/:category' , async (req , res) => {
            const category = req.params.category
            const query = {subCategory: category}
            const result = await toysCollections.find(query).toArray()
            res.send(result)
        })

        


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('toy market place server is running')
})

app.listen(port, () => {
    console.log(`server is running port ${port}`)
})