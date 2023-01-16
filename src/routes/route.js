const express =require('express')
const router= express.Router()

const controller= require('../controllers/controller')




router.post('/url/shorten',controller.createUrl)
router.get('/:urlCode',controller.getUrl)






module.exports=router