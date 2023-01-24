var express = require('express');
var path = require('path');
var router = express.Router();
router.get('/:rollno', function (req, res) {
    params: {
        rollno: req.params.rollno;
    }
    res.sendFile(path.join(__dirname, '../public/Dashboard.html'));
});
module.exports = router;
