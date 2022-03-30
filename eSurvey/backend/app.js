const express = require('express');
const app = express();


const  bodyParser = require("body-parser");
const cors = require('cors');
const mysql = require('mysql2');
const { EndOfLineState } = require('typescript');
const users = [];

app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
    origin: ["http://localhost:4200"],
    credentials: true,
    methods: "POST, PUT, OPTIONS, DELETE, GET",
    allowedHeaders: "X-Requested-With, Content-Type"
  }
  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions));


// db connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : 'Mer@sql2021',
    database:'esurvey_schema',
    port:'3306',
    multipleStatements: true
})



  connection.connect(err=>{
    if(err){console.log('err',err);}
    console.log('database connected!');
});


app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers','*',
                  "Origin,X-Requested-With,Content-Type,Accept"
                  );
    res.setHeader('Access-Control-Allow-Methods','*',
                "GET, POST, PATCH, DELETE, OPTIONS"
                );
    next();
});


app.get('/api/getAllQuestions', (req, res) => {

    let qry = `select QuestionID as id,QuestionText as Text from questions`;
    connection.query(qry,(err,result)=>{

        if(err){console.log(err,'err');}

        if(result.length>0){
            res.status(200).send({
                consultations : {
                   Questions : result
               }
            });
        }
    });
    
  });

  app.get('/api/GetQuestionOptions/:id', (req, res) => {

    let qry = `select optionID as id ,optionText as Text  from options where QuestionID= ${req.params.id}`;
    connection.query(qry,(err,result)=>{

        if(err){console.log(err,'err');}

        if(result.length>0){
            res.status(200).send({
               Question : req.params.id,
               options : result
            });
        }else{
            res.status(200).send({
                Question : req.params.id,
                options : null
             });
        }
    });
    
  });
  
  app.post('/api/registerUser', (req, res) => {

    console.log(req.body,'registerationdata');

    let snino = req.body.snino;

    let qry = `select * from user where SNI ='${snino}'`;
    connection.query(qry,(err,result)=>{

        if(err){console.log(err,'err');}

        if(result.length>0){
            res.status(403).send({
                statuscode: 403,
                message :'User already exist!',
            });
        }else{

            newqry = `insert into user(UserID,FullName,DoB,Address,PasswordHash,SNI)values ( '${req.body.newemail}','${req.body.fullname}','${req.body.dob}','${req.body.address}','${req.body.newpassword}','${req.body.snino}')`
                connection.query(newqry,(err,result)=>{

                    if(err){console.log(err,'err');
                    res.status(404).send({
                        statuscode: 404,
                        message : 'EmailId or SNI number already exist',
                       
                     });
                
            console.log(result);
                    
                    }else{
                        res.status(200).send({
                            statuscode: 200,
                            message : 'User added successfully',
                           
                         });
                    }
                });
        }
    });
    
  });

  app.post('/api/userLogin', (req, res) => {

    console.log(req.body,'logindata');

    let username = req.body.emailid;
    let hashpass =req.body.hashpass;
    let qry = `select * from user where UserID ="${username}" and PasswordHash = "${hashpass}"`;
    connection.query(qry,(err,result)=>{

        if(err){
            console.log(err,'err');
            res.status(404).send();}

        if(result && result.length>0 && !result[0].admin){
            console.log(result[0].admin,'userfound');

            res.status(200).send({
               message :'user login successfull!',
               username : result[0].FullName,
               userId : result[0].UserID,
               user : result[0].admin
            });
        }
        else if(result && result.length>0 && result[0].admin){
            console.log(result,'its admin!');
            res.status(200).send({
                message :'admin login successfull!',
                username : 'Admin',
                userId : result[0].UserID,
                user : result[0].admin
             });
        }
        else{
            console.log(req.body,'usernotfound');

            res.status(204).send({
                message :'user not found!',
                username : null,
                userId : null,
                user:null
             });
        }
    });
    
  });



    app.post('/api/saveSurvey', (req, res) => {
        let count=0;
        console.log(req.body,'surveydata');
    
        let emailId = req.body.useremail;
        console.log(emailId);
        console.log(req.body.questionanswers);
        let qry ='';
        req.body.questionanswers.forEach(element => {
            qry += `insert into results(UserID,QuestionID,ChosenOptionID)values ("${emailId}",${element.questID},${element.ansID});`;

        })
        console.log(qry);

            connection.beginTransaction();
               connection.query(qry, (err, result) => {
                    if (err) { console.log(err, 'err');
                    connection.rollback();
                    res.status(404).send({
                        message :'error in adding rows',
                    });
                }else{
                    if(result.length==req.body.questionanswers.length){
                        connection.commit();
                        res.status(200).send({
                            message :'new rows added successfully',
                        });
                    }else{
                        connection.rollback();
                        res.status(401).send({
                            message :'error in adding rows',
                        });
                    }
                }
                connection.end();

                });
    });
  
app.get('/api/GetQuestionResponse/:id', (req, res) => {

    let qry = `SELECT ChosenOptionID as id, count(*) as count  FROM esurvey_schema.results where QuestionID=${req.params.id} group by ChosenOptionID`;
    connection.query(qry,(err,result)=>{

        if(err){console.log(err,'err');}

        if(result.length>0){
            console.log(result);
            res.status(200).send({
                Question : req.params.id,
                Answers : result
            });
        }else{
            res.status(200).send({
                Question : req.params.id,
                Answers : null
                });
        }
    });
    
});


// getAllSNIs
app.get('/api/getAllSNIs', (req, res) => {

    let qry = `select SNI as SNIno from user`;
    connection.query(qry,(err,result)=>{

        if(err){console.log(err,'err');}

        if(result.length>0){
            res.status(200).send(result);
        }
    });
    
  });

module.exports = app;