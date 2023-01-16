const mongoose = require('mongoose')
const urlModel = require('../models/urlModel')
const isUrl = require("is-valid-http-url");
const shortId = require('shortid')

//==========================================CREATING URL==========================================//


const createUrl = async function (req, res) {
    try {
        const longUrl = req.body.longUrl
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "body is empty" })
        if (!longUrl) return res.status(400).send({ status: false, message: "url is required" })
        if (!isUrl(longUrl)) return res.status(400).send({ status: false, message: "url invalid" })

        const alreadyPresent = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (!alreadyPresent) {
            const urlcode = shortId.generate()
            let baseUrl = "http://localhost:3000/"
            const shortenUrl = baseUrl + urlcode

            const data = {}
            data.longUrl = longUrl
            data.shortUrl = shortenUrl
            data.urlCode = urlcode

            const saveData = await urlModel.create(data)
            return res.status(201).send({ status: true, data: data })
        }
        else {
            return res.status(200).send({ status: true, data: alreadyPresent })
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
        if (!urlCode) return res.status(400).send({ status: false, message: "provide urlCode" })
        if (!shortId.isValid(urlCode)) return res.status(400).send({ status: false, message: "urlCode invalid" })

        const isPresentUrl = await urlModel.findOne({ urlCode: urlCode }).select({ longUrl: 1, _id: 0 })
        if (!isPresentUrl) return res.status(404).send({ status: false, message: "(url not found) you can not redirect to longUrl with this urlCode" })

        res.status(302).send({ status: true, data: isPresentUrl })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }


}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl