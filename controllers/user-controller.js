const User = require('../db-models/users-models');
const UserWallet = require('../db-models/wallet-models');

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
    const newUser = new User({
        username,
        email,
        password,
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
    console.log(newUser.toObject());
    
    res.status(201).json({user: newUser.toObject({ getters: true }),
    walletBalance: newUserWallet.toObject({ getters: true })});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    // console.log(email, password);
    
    let existingUser, userWallet;
    try {
        existingUser = await User.findOne({ email: email }, '-password');
        userWallet = await UserWallet.findOne({ email: email });
    } catch (error) {
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new Error('Invalid credentials, could not log you in', 401);
        return next(error);
    }
    res.status(201).json({user: existingUser.toObject({ getters: true }),
    walletDetails: userWallet.toObject({ getters: true })});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;