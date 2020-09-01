const User = require('../db-models/users-models');
const UserWallet = require('../db-models/wallet-models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req,res,next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (error) {
        const err = new Error('fetching users failed', 500);
        return next(err);
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))})
};

const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;    
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        throw new Error('Error occurred in signing up, try again later', 500);
    }

    if (existingUser) {
        const error = new Error('User already exists', 422)
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (error) {
        const err = new Error('Could not create new user, please try again', 500)
        return next(err)
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
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({user: {
            email: email,
            id: newUser.id,
            username: username
        }, wallet: newUserWallet}, 'jwt_secret_key', { expiresIn: '10h'})
    } catch (error) {
        const err = new Error('Signing in failed, try again later', 500)
        return next(err);
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
        return next(error);
    }

    if (!existingUser) {
        const error = new Error('Invalid credentials, could not log you in', 401);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
        const err = new Error('Cannot log you in, please try again', 500)
        return next(err);
    }

    if (!isValidPassword) {
        const error = new Error('Invalid credentials', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({user: {
            email: email,
            id: existingUser.id,
            username: existingUser.username
        }, wallet: userWallet}, 'jwt_secret_key', { expiresIn: '10h'})
    } catch (error) {
        const err = new Error('Logging in failed, try again later', 500)
        return next(err);
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