const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();


        const indexKeys = { name: 1 }
        const indexOptions = { name: 'name' }
        const result = await toysCollections.createIndex(indexKeys, indexOptions)


       



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




const toysCollections = client.db('toysDB').collection('allToys')
const trendingToysCollection = client.db('toysDB').collection('trendingToys')
const customerReviewCollection = client.db('toysDB').collection('customerReview')

app.get('/trendingToys', async (req, res) => {
    const result = await trendingToysCollection.find().toArray()
    res.send(result)
})

app.get('/customerReview', async (req, res) => {
    const result = await customerReviewCollection.find().toArray()
    res.send(result)
})

app.post('/addToy', async (req, res) => {
    const toy = req.body;
    const price = parseInt(toy.price)
    toy.price = price
    // console.log(toy)
    const result = await toysCollections.insertOne(toy)
    res.send(result)
})

app.get('/allToys', async (req, res) => {
    const cursor = toysCollections.find()
    const result = await cursor.limit(20).toArray();
    res.send(result)
})

app.get('/myToys', async (req, res) => {

    const email = req.query.email;
    const price = req.query.price


    if (email) {
        if (price == 'ascending') {
            console.log(email, price)
            const result = await toysCollections.find({ sellerEmail: email }).sort({ price: 1 }).toArray()
            return res.send(result)
        } else if (price == 'descending') {
            const result = await toysCollections.find({ sellerEmail: email }).sort({ price: -1 }).toArray()
            return res.send(result)
        } else {
            const result = await toysCollections.find({ sellerEmail: email }).toArray();
            res.send(result)
        }
    } else {
        return res.status(403).send({ error: 1, message: 'Unauthorize user' })
    }


})

app.get('/allToys/:search', async (req, res) => {
    const searchText = req.params.search;

    const result = await toysCollections.find({
        $or: [
            { name: { $regex: searchText, $options: 'i' } }
        ]
    }).toArray()

    res.send(result)

})

app.delete('/deleteToys/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toysCollections.deleteOne(query)
    res.send(result)
})

app.get('/toy/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toysCollections.findOne(query)
    res.send(result)
})

app.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    const price = parseInt(newData.price)
    newData.price = price
    const filter = { _id: new ObjectId(id) };
    const updatedData = {
        $set: {
            price: newData.price,
            quantity: newData.quantity,
            description: newData.description,

        }
    }
    const result = await toysCollections.updateOne(filter, updatedData);
    res.send(result)
})

app.get('/details/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toysCollections.findOne(query);
    res.send(result)
})

app.get('/categories/:category', async (req, res) => {
    const category = req.params.category
    const query = { subCategory: category }
    const result = await toysCollections.find(query).toArray()
    res.send(result)
})







app.get('/', (req, res) => {
    res.send('toy market place server is running')
})

app.listen(port, () => {
    console.log(`server is running port ${port}`)
})