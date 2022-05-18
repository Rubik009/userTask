const User = require('../models/user.model');
const Role = require('..//models/roles.model');
const Token = require('../models/token.model');
const TokenServices = require('../services/token.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config()

const saltRound = 10;

class UsersControllers {
    async registerUser(req, body) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return 'Errors on registration';
        }
        const { username, password, role } = body;
        const candidate = await User.findOne({ username });
        if (candidate) {
            return `User with username - ${username} already exist`;
        }
        const hashPassword = await bcrypt.hash(password, saltRound);
        const userRole = new Role({ role, password : hashPassword });
        await userRole.save();
        const user = new User({ username, password: hashPassword, role: userRole.role });
        await user.save();
        const payload = {
            id: user._id,
            user: user.username,
            role: user.role,
        }
        const tokens = TokenServices.generateTokens(payload);
        await TokenServices.saveToken(user._id, tokens.refreshToken);
        return tokens;
    }
    async loginUser(body) {
        const { username, password } = body;
        const user = await User.findOne({ username });
        if (!user) {
            return `User with ${username} is not founded `;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return `${password} is not right `;
        }
        const payload = {
            id: user._id,
            user: user.username,
            role: user.role,
        }
        const tokens = TokenServices.generateTokens(payload);
        await TokenServices.saveToken(user._id, tokens.refreshToken);
        return tokens;
    }
    async logout(refreshToken) {
        const tokenData = await Token.deleteOne({ refreshToken: refreshToken });
        return tokenData;
    }
    async getUsers() {
        const users = User.find();
        return users;
    }
    async getOneUser(id) {
        const user = await User.findOne({ _id : id });
        return user;
    }
    async updateUser(id, role) {
        const updateUser = await User.findOneAndUpdate({ _id: id }, { $set: { role: role } })
        return `User ${updateUser.username} changed role to ${role}`
    }
    async deleteUser(id) {
        const user = await User.deleteOne({ _id: id });
        return user;
    }
}

module.exports = new UsersControllers();