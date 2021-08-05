const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_I = 10;
const app = express();

const mongoUri = 'mongodb+srv://admin:admin123@cluster0.qpyaq.mongodb.net/authApp?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set('useCreateIndex', true);
///////// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
const {authenticate} = require('./middleware/auth');

/////// Models
 const {User}  = require('./models/user');


 ////// Routes
 app.post('/api/user',(req, res)=>{
     const user = new User({
         email: req.body.email,
         password: req.body.password
     });

     
     user.save((err,doc)=>{
         if(err) return res.status(400).send(err);
         res.status(200).send(doc);
     })
 })

 app.post('/api/user/login',(req,res)=>{
     // 1- find the user, if good ->
     User.findOne({'email':req.body.email}, (err,user)=>{
         if(!user) res.json({message:'User not found'});
        //  res.status(200).send(user)

        // 2- compare the string with the hash ->
        // bcrypt.compare(req.body.password, user.password,(err,isMatch)=>{
        //     if(err) res.json({message: 'Password incorrect!!'})
        //     res.status(200).send(isMatch)
        // })
        user.comparePassword(req.body.password, (err, isMatch)=>{
            if(err) throw err;
            if(!isMatch) return res.status(400).json({
                message: 'Bad Password!!'
            });
             // 3- send response
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('auth', user.token).send('ok')
                // res.json('ok')
            })  
        }) 
     })  
 });

 app.get('/api/books',authenticate, (req,res)=>{

    res.status(200).send(req.email)
    //  let token = req.cookies.auth;
    //  User.findByToken(token,(err,user)=>{
    //      if(err) throw err;
    //      if(!user) return res.status(401).send({message: 'Bad token'});
    //      res.status(200).send(user)
    //  })
    //  res.status(200).send('working');
 })
const port = process.env.PORT || 3001;
app.listen(port,()=>{
    console.log(`started on port ${port}`)
})