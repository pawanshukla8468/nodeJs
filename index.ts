const express = require('express');
const fs = require('fs');
const path = require('path');
const url = require('url');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const conn = require('./conn');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended : true}))

//Static path to serve by NodeJS Server
app.use(express.static(path.join(__dirname, "public")));

//Setting Routes for the Application
app.get('/home',require('./Routes/home'));
app.get('/studentRegister', require('./Routes/studentRegistation'));
app.get('/student/login', require('./Routes/studentlogin'));
app.get('/admin', require('./Routes/adminlogin'));
app.get('/admin/bankdetails', require('./Routes/bankdetails'));
app.get('/admin/feedetails', require('./Routes/feedetails'));
app.get('/admin/deleteStudent', require('./Routes/deletestudent'));
app.get('/admin/updateAcademic', require('./Routes/updateacademic'));
app.get('/resetpassword', require('./Routes/resetpassword'));
app.get('/:rollno', require('./Routes/dashboard'));

app.post('/studentRegister',(req:any, res:any)=>{
    // console.log(req.body);
    let rollno : number = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
    let name : string =  req.body.studentname;
    let standard : string = req.body.standard;
    let father : string = req.body.fathername;
    let mother : string = req.body.mothername;
    let dob : Date = req.body.dob;
    let mobileno : number = req.body.mobileno;
    let country : string = req.body.country;
    let state : string = req.body.state;
    let pincode : number = req.body.pincode;
    let studentemail : string = req.body.studentemail;
    let password : string = req.body.password;
    let confirmpassword : string = req.body.confirmpassword;
    let gender : string = req.body.gender;
    let marks:number = 0;
    let percentage:number = 0;
    let grade:string = ' ';
    bcrypt.genSalt(10, (err:any, salt:any) => {
        bcrypt.hash(password, salt, (err:any, hash:string)=> {
            if(err){
                console.log(err);
                res.send({
                    success : false,
                    statusCode : 500,
                    message: 'Getting Error during the Connection'
                });
                return;
            }else{
                if(password !== confirmpassword){
                    // alert('Please Enter Same password as Confirm Password');
                    console.log(`Confirm Password is not same as Entered Password.`);
                }else{
                    var query : string = `INSERT INTO STUDENTS VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    conn.query(query,[rollno, name, standard, father, mother, dob, country, state, pincode, studentemail, hash, marks, percentage, grade,gender ,mobileno], (err:any, result:any)=>{
                        if(err){
                            console.log(err);
                        }else{
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

app.post('/student/login', (req:any, res:any)=>{
    console.log(req.body);
    var email : string = req.body.email;
    var password : string = req.body.password;
    if(email && password){
        var query:string = `SELECT * FROM STUDENTS WHERE STUDENT_EMAIL = ? AND PASSWORD = ?`;
        conn.query(query, [email, password], (err:any, result:any)=>{
            if(err){
                console.log(err);
                res.send({
                    success : false,
                    statusCode : 400,
                    data: err
                });
                return;
            }
            if(result.length == 0){
                console.log(`User Not Registered Kindly Register Yourself!!`);
            }
            if(result.length > 0){
                let dbemail:string = result[0].STUDENT_EMAIL;
                let dbpass:string = result[0].PASSWORD;
                let dbroll:number = result[0].ROLLNO;
                if(email != dbemail){
                    console.log("Please Enter Correct Email Id");
                }
                
                
                if(password != dbpass){
                    console.log(`Incorrect Password Please Try Again!!!`);
                }else{
                    console.log(`Welcome to the Profile`);
                    res.send(`/:${dbroll}`);
                }
            }
        });
    }
});

app.post('/admin/deleteStudent', (req:any, res:any)=>{
    let rollno:number = parseInt(req.body.rollno);
    let email:string = req.body.emailid;
    console.log(req.body);
    let searchquery:string = `SELECT * FROM STUDENTS WHERE ROLLNO = ? AND STUDENT_EMAIL = ?`;
    conn.query(searchquery,[rollno, email], (err:any, result:any)=>{
        if(err){
            console.log(err);
            res.send({
                success : false,
                statusCode : 500,
                message: 'Getting Error during the Connection'
            });
            return;
        }
        else if(result.length == 0){
            console.log(`RollNo. ${rollno} not present in the Database`);
        }
        else{
            let deletequery:String = `DELETE FROM STUDENTS WHERE ROLLNO = ? AND STUDENT_EMAIL = ?`;
            conn.query(deletequery,[rollno, email] ,(err:any, result:any)=>{
                if(err){
                    console.log(err);
                    res.send({
                        success : false,
                        statusCode : 500,
                        message: 'Getting Error during the Connection'
                    });
                    return;
                }
                else{
                    console.log(result);
                    // alert('Record Erased Successfully from the Database');
                    console.log(`Record Erased Successfully from the Database`);
                }   
            });
        }
    });
});

app.post('/admin/feedetails', (req:any, res:any)=>{
    console.log(req.body);
    let rollno:number = req.body.rollno;
    let admissionyear:number = req.body.year;
    let receiptno:number = req.body.receiptno;
    let admissionno:number = req.body.admissionno;
    let studentname:string = req.body.studentname;
    let feeamount:number = req.body.feeamount;
    let feedate:Date = req.body.depositedate;
    let feestatus:string = "";
    if(req.body.feestatus == 1){
        feestatus = 'SUBMITTED';
    }
    if(req.body.feestatus == 2){
        feestatus = 'PENDING';
    }

    let query:String = `INSERT INTO FEE_RECORD VALUES(?,?,?,?,?,?,?,?)`;
    conn.query(query, [studentname, receiptno, admissionno, admissionyear, feedate, feestatus, feeamount, rollno], (err:any, result:any)=>{
        if(err){
            console.log(err);
            res.send({
                success : false,
                statusCode : 500,
                message: 'Getting Error during the Connection'
            });
            return;
        }else{
            console.log(result);
            // alert(`Record Updated Succeessfully!!!`);
            console.log(`1 Record Inserted Successfully!!!`);
        }
    });
});

app.post('/admin/updateAcademic', (req:any, res:any)=>{
    console.log(req.body);
    let rollno:number = req.body.rollno;
    let emailid:string = req.body.emailid;
    let totalmarks:number = req.body.totalmarks;
    let obtainedmarks:number = req.body.obtainedmarks;

    let percentage:number = (obtainedmarks/totalmarks)*100;
    req.body.percentage = percentage;
    let grade:string;
    console.log(req.body);
    if(percentage <= 99 && percentage >= 80) {
        grade = "A";
    }
    else if(percentage <= 79 && percentage >=60){
        grade = "B";
    }
    else if(percentage <= 59 && percentage >= 40){
        grade = "C";
    }else{
        grade = "D";
    } 
    
    req.body.grade = grade;
    // JSON.parse({
    //     "grade" : grade,
    //     "percentage" : percentage
    // })
    
    let query:string = `UPDATE STUDENTS SET PERCENTAGE = ? , MARKS = ? , GRADE = ? WHERE ROLLNO = ?`;
    conn.query(query, [percentage, obtainedmarks, grade, rollno], (err:any, result:any)=>{
        if(err){
            console.log(err);
            res.send({
                statusCode : 500,
                success : false,
                message : 'Error Occured in Database Connection'
            });
        }else{
            console.log(`Record updated Successfull for Roll No. : ${rollno}`);
            res.send({
                statusCode : 200,
                success : true,
                message : 'Record updated Successfully'
            });
        }
    });
});
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT : ${PORT}`);
});

