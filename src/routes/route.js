const express =require('express')
const router= express.Router()
const controller= require('../controllers/controller')


//=================================================API's===================================================//

router.post('/url/shorten',controller.createUrl)
router.get('/:urlCode',controller.getUrl)



router.all('/*',function(req,res){
    res.status(404).send("http request not found")
})






module.exports=router