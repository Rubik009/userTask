let express = require('express');
let mongoose = require('mongoose')
let app = express();
require('dotenv').config();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'First API ',
            description: 'The description of todolist',
            contacts: {
                name: 'Roman Rubinshteyn'
            },
            servers: ['http://localhost:3000/'],
            version: '1.0.0'
        }
    },
    apis: ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json())
app.use(cookieParser());
const routes = require("./routes/index");
app.use("/api", routes);

const server = app.listen(process.env.PORT, () => console.log('Server started'));
const db = mongoose.connect(process.env.DB_CONNECTION_PORT, () => console.log('Connected to MongoDB'));


module.exports = server, db;
