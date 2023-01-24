var express = require('express');
var fs = require('fs');
var path = require('path');
var url = require('url');
var bodyparser = require('body-parser');
var bcrypt = require('bcrypt');
var dotenv = require('dotenv');
var conn = require('./conn');
var jwt = require('jsonwebtoken');
var app = express();
var PORT = 3000;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//Static path to serve by NodeJS Server
app.use(express.static(path.join(__dirname, "public")));
//Setting Routes for the Application
app.get('/home', require('./Routes/home'));
app.get('/studentRegister', require('./Routes/studentRegistation'));
app.get('/student/login', require('./Routes/studentlogin'));
app.get('/admin', require('./Routes/adminlogin'));
app.get('/admin/bankdetails', require('./Routes/bankdetails'));
app.get('/admin/feedetails', require('./Routes/feedetails'));
app.get('/admin/deleteStudent', require('./Routes/deletestudent'));
app.get('/admin/updateAcademic', require('./Routes/updateacademic'));
app.get('/resetpassword', require('./Routes/resetpassword'));
app.get('/:rollno', require('./Routes/dashboard'));
app.post('/studentRegister', function (req, res) {
    // console.log(req.body);
    var rollno = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
    var name = req.body.studentname;
    var standard = req.body.standard;
    var father = req.body.fathername;
    var mother = req.body.mothername;
    var dob = req.body.dob;
    var mobileno = req.body.mobileno;
    var country = req.body.country;
    var state = req.body.state;
    var pincode = req.body.pincode;
    var studentemail = req.body.studentemail;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;
    var gender = req.body.gender;
    var marks = 0;
    var percentage = 0;
    var grade = ' ';
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    statusCode: 500,
                    message: 'Getting Error during the Connection'
                });
                return;
            }
            else {
                if (password !== confirmpassword) {
                    // alert('Please Enter Same password as Confirm Password');
                    console.log("Confirm Password is not same as Entered Password.");
                }
                else {
                    var query = "INSERT INTO STUDENTS VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    conn.query(query, [rollno, name, standard, father, mother, dob, country, state, pincode, studentemail, hash, marks, percentage, grade, gender, mobileno], function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(result.insertId);
                            // alertbox(`Student Registered Successfully!! Your Roll No. : ${rollno}`);
                            console.log("1 Record Inserted Successfully!!!");
                            console.log(hash);
                        }
                    });
                }
            }
        });
    });
});
app.post('/student/login', function (req, res) {
    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    if (email && password) {
        var query = "SELECT * FROM STUDENTS WHERE STUDENT_EMAIL = ? AND PASSWORD = ?";
        conn.query(query, [email, password], function (err, result) {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    statusCode: 400,
                    data: err
                });
                return;
            }
            if (result.length == 0) {
                console.log("User Not Registered Kindly Register Yourself!!");
            }
            if (result.length > 0) {
                var dbemail = result[0].STUDENT_EMAIL;
                var dbpass = result[0].PASSWORD;
                var dbroll = result[0].ROLLNO;
                if (email != dbemail) {
                    console.log("Please Enter Correct Email Id");
                }
                if (password != dbpass) {
                    console.log("Incorrect Password Please Try Again!!!");
                }
                else {
                    console.log("Welcome to the Profile");
                    res.send("/:".concat(dbroll));
                }
            }
        });
    }
});
app.post('/admin/deleteStudent', function (req, res) {
    var rollno = parseInt(req.body.rollno);
    var email = req.body.emailid;
    console.log(req.body);
    var searchquery = "SELECT * FROM STUDENTS WHERE ROLLNO = ? AND STUDENT_EMAIL = ?";
    conn.query(searchquery, [rollno, email], function (err, result) {
        if (err) {
            console.log(err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting Error during the Connection'
            });
            return;
        }
        else if (result.length == 0) {
            console.log("RollNo. ".concat(rollno, " not present in the Database"));
        }
        else {
            var deletequery = "DELETE FROM STUDENTS WHERE ROLLNO = ? AND STUDENT_EMAIL = ?";
            conn.query(deletequery, [rollno, email], function (err, result) {
                if (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        statusCode: 500,
                        message: 'Getting Error during the Connection'
                    });
                    return;
                }
                else {
                    console.log(result);
                    // alert('Record Erased Successfully from the Database');
                    console.log("Record Erased Successfully from the Database");
                }
            });
        }
    });
});
app.post('/admin/feedetails', function (req, res) {
    console.log(req.body);
    var rollno = req.body.rollno;
    var admissionyear = req.body.year;
    var receiptno = req.body.receiptno;
    var admissionno = req.body.admissionno;
    var studentname = req.body.studentname;
    var feeamount = req.body.feeamount;
    var feedate = req.body.depositedate;
    var feestatus = "";
    if (req.body.feestatus == 1) {
        feestatus = 'SUBMITTED';
    }
    if (req.body.feestatus == 2) {
        feestatus = 'PENDING';
    }
    var query = "INSERT INTO FEE_RECORD VALUES(?,?,?,?,?,?,?,?)";
    conn.query(query, [studentname, receiptno, admissionno, admissionyear, feedate, feestatus, feeamount, rollno], function (err, result) {
        if (err) {
            console.log(err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting Error during the Connection'
            });
            return;
        }
        else {
            console.log(result);
            // alert(`Record Updated Succeessfully!!!`);
            console.log("1 Record Inserted Successfully!!!");
        }
    });
});
app.post('/admin/updateAcademic', function (req, res) {
    console.log(req.body);
    var rollno = req.body.rollno;
    var emailid = req.body.emailid;
    var totalmarks = req.body.totalmarks;
    var obtainedmarks = req.body.obtainedmarks;
    var percentage = (obtainedmarks / totalmarks) * 100;
    req.body.percentage = percentage;
    var grade;
    console.log(req.body);
    if (percentage <= 99 && percentage >= 80) {
        grade = "A";
    }
    else if (percentage <= 79 && percentage >= 60) {
        grade = "B";
    }
    else if (percentage <= 59 && percentage >= 40) {
        grade = "C";
    }
    else {
        grade = "D";
    }
    req.body.grade = grade;
    // JSON.parse({
    //     "grade" : grade,
    //     "percentage" : percentage
    // })
    var query = "UPDATE STUDENTS SET PERCENTAGE = ? , MARKS = ? , GRADE = ? WHERE ROLLNO = ?";
    conn.query(query, [percentage, obtainedmarks, grade, rollno], function (err, result) {
        if (err) {
            console.log(err);
            res.send({
                statusCode: 500,
                success: false,
                message: 'Error Occured in Database Connection'
            });
        }
        else {
            console.log("Record updated Successfull for Roll No. : ".concat(rollno));
            res.send({
                statusCode: 200,
                success: true,
                message: 'Record updated Successfully'
            });
        }
    });
});
app.listen(PORT, function () {
    console.log("Server is running on PORT : ".concat(PORT));
});
