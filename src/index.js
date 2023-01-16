const express =require('express')
const app = express()
const mongoose=require('mongoose')
const route = require('./routes/route')

app.use(express.json())

mongoose.set('strictQuery',true)  //to handle deprication error


mongoose.connect("mongodb+srv://AmritaSingh:AAsingh1627@cluster016.jdmspyj.mongodb.net/group10database",{
    useNewUrlParser:true
})
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log(err))





app.use('/',route)


app.listen(3000,function(){
    console.log("server is running on",3000)
})