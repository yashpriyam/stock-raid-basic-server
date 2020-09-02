const User = require('../db-models/users-models');
const UserWallet = require('../db-models/wallet-models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req,res,next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (error) {
        return res.status(400).json({message: 'fetching users failed, please try again'})
        // const err = new Error('fetching users failed', 500);
        // return next(err);
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))})
};

const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;    
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        return res.status(400).json({message: 'Error occurred in sign up, please try again'})
        // throw new Error('Email already tken, try with different email id', 500);
    }

    if (existingUser) {
        return res.status(422).json({message: 'Email already tken, try with different email id'})
        // const error = new Error('Email already tken, try with different email id', 422)
        // return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (error) {
        return res.status(400).json({message: 'Error occurred in sign up, please try again'})
        // const err = new Error('Could not create new user, please try again', 500)
        // return next(err)
    }
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    });

    const newUserWallet = new UserWallet({
        username,
        email,
        walletBalance: 2500
    });

    try {
        await newUser.save();
        await newUserWallet.save();
    } catch (error) {
        return res.status(400).json({message: 'Error occurred in sign up, please try again'})
        // return next(error);
    }

    let token;
    try {
        token = jwt.sign({user: {
            email: email,
            id: newUser.id,
            username: username
        }, wallet: newUserWallet}, 'jwt_secret_key', { expiresIn: '10h'})
    } catch (error) {
        return res.status(400).json({message: 'Error occurred in sign up, please try again'})
        // const err = new Error('Signing in failed, try again later', 500)
        // return next(err);
    }
    
    res.status(201).json({user: {
        email: email,
        id: newUser.id,
        username: username
    }, wallet: newUserWallet.toObject({ getters: true }), token: token});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    
    let existingUser, userWallet;
    try {
        existingUser = await User.findOne({ email: email });
        userWallet = await UserWallet.findOne({ email: email });
    } catch (error) {
        return res.status(400).json({message: 'Invalid credentials'})
    }

    if (!existingUser) {
        // const error = new Error('Invalid credentials, could not log you in', 401);
        return res.status(400).json({message: 'Invalid credentials'})
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
        return res.status(400).json({message: 'Invalid credentials'})
        // return next(err);
    }

    if (!isValidPassword) {
        // const error = new Error('Invalid credentials', 401);
        // return next(error);
        return res.status(400).json({message: 'Invalid credentials'})
    }

    let token;
    try {
        token = jwt.sign({user: {
            email: email,
            id: existingUser.id,
            username: existingUser.username
        }, wallet: userWallet}, 'jwt_secret_key', { expiresIn: '10h'})
    } catch (error) {
        // const err = new Error('Logging in failed, try again later', 500)
        // return next(err);
        return res.status(400).json({message: 'Invalid credentials'})
    }

    res.status(201).json({user: {
        email: email,
        id: existingUser.id,
        username: existingUser.username
    }, wallet: userWallet.toObject({ getters: true }), token: token});
    // res.status(201).json({user: existingUser.toObject({ getters: true }),
    // walletDetails: userWallet.toObject({ getters: true })});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;