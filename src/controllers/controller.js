const mongoose = require('mongoose')
const urlModel = require('../models/urlModel')
const isUrl = require("is-valid-http-url");
const shortId = require('shortid')
const redis=require('redis')
const {promisify}=require('util')



// create connection to redis with the help javascript redis module

const redisClient =redis.createClient(
    12989,
    "redis-12989.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    {no_ready_check:true}
)
redisClient.auth("K7MZgZE8q0MYS6OriXS0mvXXaSr4SwTO",function(err){
    if(err) throw err
})
redisClient.on("connect",async function(){
    console.log("connected to Redis")
})


// prepare function so that our redis module method return response in promise object, not by the call back function


const GET_ASYNC =promisify(redisClient.GET).bind(redisClient)
const SETEX_ASYNC=promisify(redisClient.SETEX).bind(redisClient)








//==========================================CREATING URL==========================================//


const createUrl = async function (req, res) {
    try {
        const longUrl = req.body.longUrl
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "body is empty" })
        if (!longUrl) return res.status(400).send({ status: false, message: "url is required" })
        if (!isUrl(longUrl)) return res.status(400).send({ status: false, message: "url invalid" })

        const cacheData= await GET_ASYNC(`${longUrl}`)
        if(!cacheData){
            const alreadyPresent = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
            if (!alreadyPresent) {
                const urlcode = shortId.generate()
                let baseUrl = "http://localhost:3000/"
                const shortenUrl = baseUrl + urlcode
    
                const data = {}
                data.longUrl = longUrl
                data.shortUrl = shortenUrl
                data.urlCode = urlcode
                
                res.status(201).send({ status: true, data: data })
                await urlModel.create(data)
                SETEX_ASYNC(`${longUrl}`,86400,JSON.stringify(data))
            }
            else {
                res.status(200).send({ status: true, data: alreadyPresent })
                SETEX_ASYNC(`${longUrl}`,86400,JSON.stringify(alreadyPresent))

            }
        }
        else{
            return res.status(200).send({status:true,data:JSON.parse(cacheData)})
        }

        
        
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}

//==========================================GETTING URL===============================================//



const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        if (!shortId.isValid(urlCode)) return res.status(400).send({ status: false, message: "urlCode invalid" })

        const cacheData =await GET_ASYNC(`${urlCode}`)
        
        if(cacheData) {
            console.log("I am in cache")
            return res.status(302).redirect(cacheData)
        }
        else{
            console.log("i am not in cache")
            const isPresentUrl = await urlModel.findOne({ urlCode: urlCode }).select({ longUrl: 1, _id: 0 })
            if (!isPresentUrl) return res.status(404).send({ status: false, message: "(url not found) you can not redirect to longUrl with this urlCode" })
            console.log(isPresentUrl.longUrl)
            res.status(302).redirect(isPresentUrl.longUrl)
            await SETEX_ASYNC(`${urlCode}`,86400,JSON.stringify(isPresentUrl.longUrl))
            
        }
        
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }


}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl



