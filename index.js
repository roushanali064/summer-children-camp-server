const express = require('express');
const app = express();
const cors = require('cors');
const port  = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());


//apis

app.get('/',(req,res)=>{
    res.send('the summer very hotter')
})

// app listen

app.listen(port,()=>{
    console.log(`hotter summer on port ${port}`)
})