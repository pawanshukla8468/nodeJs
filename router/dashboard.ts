const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/:rollno', (req:any, res:any)=>{
    params : {
        rollno : req.params.rollno
    }
    res.sendFile(path.join(__dirname, '../public/Dashboard.html'));
})

module.exports = router;