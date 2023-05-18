const express = require('express');
const cors = require('cors');

const app = express();

// middleware 
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000 ;

app.get('/' , (req , res) =>{
    res.send('toy market place server is running')
})

app.listen(port , () =>{
    console.log(`server is running port ${port}`)
})