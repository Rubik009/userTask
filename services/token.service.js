const User = require('../models/user.model');
const Role = require('..//models/roles.model');
const Token = require('../models/token.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class TokenServices {
   generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        }
    }
    async saveToken(user_id, refreshToken) {
        const tokenData = await Token.findOne({ user: user_id });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await Token.create({ user: user_id, refreshToken })
        return token;
    }
    validationAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log(userData)
            return userData;
        } catch (err) {
            return null;
        }
    }
    validationRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            return userData;
        } catch (err) {
            return null;
        }
    }
    async refreshToken(refreshToken) {
        const user = this.validationRefreshToken(refreshToken);
        const tokenFromDb = await Token.findOne({ refreshToken: refreshToken });
        console.log(tokenFromDb)
        if (!user || !tokenFromDb) {
            return 'User is not authorized'
        }
        const payload = {
            id: user._id,
            user: user.username,
            role: user.role,
        }
        const tokens = this.generateTokens(payload);
        console.log(tokens)
        await this.saveToken(user._id, tokens.refreshToken);
        return tokens;
    }
}

module.exports = new TokenServices ();

