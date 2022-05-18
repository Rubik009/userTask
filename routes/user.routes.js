const express = require("express");
const router = express.Router();
const UsersControllers = require('../controllers/user.controller');
const TokenServices = require('../services/token.service');
const { check } = require('express-validator');
const roleAuthenticatToken = require('../middleware/role.auth');
const authenticatToken = require('../middleware/auth')

/**
 * @swagger
 *  /api/user/register:
 *    post:
 *      description: 
 *          Register.
 *      tags:
 *          - Users
 *      parameters:
 *        - name: user 
 *          in: body
 *          description: user object
 *          required: true
 *          schema:
 *            $ref: '#/definitions/User'
 *      responses:
 *        200:
 *          description: User registration
 *          schema:
 *              title: Return String
 *              type: string
 *              example: "User added"
 * definitions:
 *   User:
 *     description: User object
 *     properties:
 *       username:
 *         type: string
 *         example: alesia
 *         description: username
 *       password:
 *         type: string
 *         example: 'alesia'
 *         description: user password
 *     required:
 *      - username
 *      - password
 */
router.post("/register", [
    check('username', 'username should not be empty').notEmpty(),
    check('password', 'password should be at least 4 symbols').isLength({ min: 4 })
], async (req, res) => {
    try {
        const user = await UsersControllers.registerUser(req, req.body);
        res.cookie('refreshToken', user.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        res.status(200).json({ message: user });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Registration failed' })
    }
});


/**
 * @swagger
 *  /api/user/login:
 *    post:
 *      description: 
 *          Login.
 *      tags:
 *          - Users
 *      parameters:
 *        - name: user 
 *          in: body
 *          description: user object
 *          required: true
 *          schema:
 *            $ref: '#/definitions/User'
 *      responses:
 *        200:
 *          description: Successful response
 *          schema:
 *              title: Return String
 *              type: string
 *              example: "succesfully"
 * definitions:
 *   User:
 *     description: User object
 *     properties:
 *       username:
 *         type: string
 *         example: roman
 *         description: user login
 *       password:
 *         type: string
 *         example: 'roman'
 *         description: user password 
 *     required:
 *      - username
 *      - password
 */
router.post('/login', async (req, res) => {
    try {
        const token = await UsersControllers.loginUser(req.body);
        res.cookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        res.status(200).json({ token });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Login failed' })
    }
});

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        //console.log(req.cookies.refreshToken)
        const token = await UsersControllers.logout(refreshToken);
        res.clearCookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.status(200).json({ message: token });
    } catch (err) {
        console.log(err);
    }
})

router.get('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const token = TokenServices.refreshToken(refreshToken);
        res.cookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        res.status(200).json({ token });
    } catch (err) {
        console.log(err)
    }
})

/**
 * @swagger
 * /api/user:
 *  get:
 *      description: Use a request to get users only for admins
 *      tags:
 *        - Users
 *      parameters:
 *      - name : authorization
 *        in : header
 *        type : string
 *        required : true 
 *      responses:
 *          '200':
 *              description: A succesful response
 */
router.get("/", roleAuthenticatToken('admin'), async (req, res) => {
    try {
        const users = await UsersControllers.getUsers();
        res.status(200).json({ message: "List of users", users });
    } catch (err) {
        console.log({ message: err });
    }
});

/**
 * @swagger
 * /api/user/{id}:
 *  get:
 *      description: See user by id for admins
 *      tags:
 *        - Users
 *      consumes:
 *        - application/json
 *      parameters:
 *        - name : authorization
 *          in : header
 *          type : string
 *          required : true
 *        - in : path
 *          name : id
 *          type : string
 *          required : true 
 *      responses:
 *          '200':
 *              description: A succesful response
 */
router.get("/:id", roleAuthenticatToken('admin'), async (req, res) => {
    try {
        const user = await UsersControllers.getOneUser(req.params.id);
        res.status(200).json({ message: "User", user });

    } catch (err) {
        console.log({ message: err });
    }
});


/**
 * @swagger
 * /api/user/update/{id}:
 *  patch:
 *      description: Edit user in the list for admins
 *      tags:
 *        - Users
 *      consumes:
 *        - application/json
 *      parameters:
 *        - name : authorization
 *          in : header
 *          type : string
 *          required : true
 *        - in : path
 *          name : id
 *          type : string
 *          required : true 
 *        - in: body
 *          name: Users
 *          required: true
 *          description: write user id need to change username
 *          schema:
 *              $ref: '#/definitions/Users'
 *      responses:
 *          '200':
 *              description: A succesful response
 * definitions:
 *  Edit_User:
 *      type: object
 *      required:
 *          - username
 *      properties:
 *          username: 
 *              type: string
 */
router.patch("/update/:id", roleAuthenticatToken('admin'), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        const decodedtoken = JSON.parse(atob(token.split('.')[1]));
        const user = await UsersControllers.updateUser(req.params.id, req.body.role, decodedtoken.username);
        res.status(200).json({ message: user });

    } catch (err) {
        console.log({ message: err });
    }
});


/**
 * @swagger
 * /api/user/delete/{id}:
 *  delete:
 *      description: Delete user for admins
 *      tags:
 *        - Users
 *      consumes:
 *        - application/json
 *      parameters:
 *        - name : authorization
 *          in : header
 *          type : string
 *          required : true 
 *        - in : path
 *          type : string
 *          name : id
 *          required : true 
 *      responses:
 *          '200':
 *              description: A succesful response
 */
router.delete("/delete/:id", roleAuthenticatToken('admin'), async (req, res) => {
    try {
        const user = await UsersControllers.deleteUser(req.params.id);
        res.status(200).json({ message: "User deleted!", user });

    } catch (err) {
        console.log({ message: err });
    }
});

module.exports = router;