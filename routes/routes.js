const express = require('express');
const router= express.Router();
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const Op = Sequelize.Op;
const { sequelize, db } = require('../models');
// Get references to our models.
const { User, Course } = db;
const database = require('../seed/database');

function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        res.status(500).send(error);
      }
    }
  }

  const authenticateUser = async (req, res, next) => {
    let message = null;
    const credentials = auth(req);
    //console.log(credentials);
    // If the user's credentials are available...
    if (credentials) {
        // Attempt to retrieve the user from the data store
        // by their username (i.e. the user's "key"
        // from the Authorization header).
        const user = await User.findOne({
            where:{
                emailAddress: credentials.name
            }
        });
        //console.log(user);

        // If a user was successfully retrieved from the data store...
        if (user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
          const authenticated = bcryptjs
              .compareSync(credentials.pass, user.password);

        // If the passwords match...
          if (authenticated) {
              console.log(`Authentication successful for username: ${user.username}`);

              // Then store the retrieved user object on the request object
              // so any middleware functions that follow this middleware function
              // will have access to the user's information.
              req.currentUser = user;
          } else {
              message = `Authentication failure for username: ${user.username}`;
          }
        } else {
          message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    // If user authentication failed...
    if (message) {
        console.warn(message);

        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
    } else {
        // Or if user authentication succeeded...
        // Call the next() method.
        next();
    }
  }

router.get('/',asyncHandler(async (req,res)=>{
    try{
        await sequelize.authenticate();
        console.log('Connection to the database successful!');
    }catch (error) {
        throw error;
      }
}));

router.get('/users',authenticateUser,asyncHandler(async (req,res)=>{

    try{
        const user = req.currentUser;
        //console.log(users.map(user => user.get({ plain: true })));
        res.status(200);
        res.json(user);
    }catch (error) {
        throw error;
      }
}));

router.post('/users',asyncHandler(async (req,res)=>{
    let user;
    //console.log(req.body);
    try{
        const newUser = req.body;
        if(newUser && newUser.password){
          newUser.password = bcryptjs.hashSync(newUser.password);
        }
        user = await User.create(newUser);
        res.location('/');
        res.status(201).end();
    }
    catch(error){
        if(error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError"){
            user = await User.build(req.body);
            user.id = req.params.id;
            const errorMessages = error.message.split("\n");
            res.status(400).json({errors: errorMessages} );
            next();
        }
        else{
            throw error;
        }

    }
}));

router.get('/courses',asyncHandler(async (req,res)=>{
    try{
        const courses = await Course.findAll({
            include: [
              {
                model: User,
              },
            ],
          });
        //console.log(users.map(user => user.get({ plain: true })));
        res.status(200);
        res.json(courses);
    }catch (error) {
        throw error;
      }
}));

router.get('/courses/:id',asyncHandler(async (req,res)=>{
    try{
        const course = await Course.findByPk(req.params.id,{
            include: [
              {
                model: User,
              },
            ],
          });
        //console.log(users.map(user => user.get({ plain: true })));
        res.status(200);
        res.json(course);
    }catch (error) {
        throw error;
      }
}));

router.post('/courses',authenticateUser,asyncHandler(async (req,res)=>{
    let course;
    //console.log(req.body);
    try{
        course = await Course.create(req.body,{
            include: [
                {
                  model: User,
                },
              ],
        });
        res.location('/api/courses/'+course.id);
        res.status(201).end();
    }
    catch(error){
        //console.log(error.message);
        if(error.name === "SequelizeValidationError"){
            course = await Course.build(req.body);
            course.id = req.params.id;
            //const errorMessages = error.array().map(error => error.msg);
            const errorMessages = error.message.split("\n");
            res.status(400).json({ errors: errorMessages });
            next();
        }
        else{
            throw error;
        }

    }
}));

router.put('/courses/:id',authenticateUser,asyncHandler(async (req,res)=>{
    try{
        const course = await Course.findByPk(req.params.id,{
            include: [
              {
                model: User,
              },
            ],
          });
        if(course){
          const user = req.currentUser;
          if(user.emailAddress === course.User.emailAddress){
            const newCourse ={  };
            for( let key in Course.rawAttributes ){
              newCourse[key] = req.body.key? req.body.key:null;
            }
            await course.update(newCourse);
            res.status(204).end();
          }
          else{
            res.status(403).send("Unable to update course. Please make sure you own this course");
          }
        }
        else{
          const error = new Error("Unable to find course.");
          error.name = "SequelizeValidationError";
          throw error;

        }

    }catch (error) {
        if(error.name === "SequelizeValidationError"){
            course = await Course.build(req.body);
            course.id = req.params.id;
            //const errorMessages = error.array().map(error => error.msg);
            const errorMessages = error.message.split("\n");
            res.status(400).json({ errors: errorMessages });
            next();
        }
        else{
            throw error;
        }
      }
}));


router.delete('/courses/:id',authenticateUser,asyncHandler(async (req,res)=>{
    try{
        const course = await Course.findByPk(req.params.id,{
            include: [
              {
                model: User,
              },
            ],
          });
        const user = req.currentUser;
        if(user.emailAddress === course.User.emailAddress){
          //console.log(users.map(user => user.get({ plain: true })));
          await course.destroy();
          res.status(204).end();
        }
        else{
          //console.log("Not equal");
          res.status(403).send("Unable to delete course. Please make sure you own this course");
        }
    }catch (error) {
        throw error;
      }
}));

module.exports = router;