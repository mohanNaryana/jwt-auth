const express = require("express")
const app =  express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require("@prisma/client"); // Use PrismaClient

const prisma = new PrismaClient();

const jwt_secret = 'hello'

app.use(express.json());

app.post("/signup",async (req,res)=>{
    const { username , password } = req.body
   
    const hashedpassword = await bcrypt.hash(password,10)
    try{
        const newuser = await prisma.users.create({
            data : {
                username : username,
                password : hashedpassword
            }
        })
        res.json({
            msg : "registered successfully",
            user : newuser,
        })
    }catch(error) {
        res.status(404).json({
            msg : "registration unsuccessful"
        })
    }

    
})


app.post("/signin",async (req,res)=>{
    const { username , password } = req.body
    
    try{
        const user = await prisma.users.findUnique({
            where : {
                username : username
            }
        })
    
        if(!user){
            res.status(404).json({
                msg : "user not found"
            })
        }
    
        const validpassword = await bcrypt.compare(password,user.password)
        if(!validpassword){
            res.json({
                msg : "incorrect password"
            })
        }
        const token = jwt.sign({ username: user.username }, jwt_secret, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    }
    catch(error){
        console.error(error)
        res.status(404).json({
            msg : "unable to login"
        })
    }
    
})

app.get("/",(req,res)=>{ 
    res.send("hey i hello mohan");
})

app.listen(5000)
