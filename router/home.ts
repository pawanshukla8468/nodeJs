const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/home', (req: any, res:any)=>{
    res.sendFile(path.join(__dirname, "../public/main.html"))
})

module.exports = router;