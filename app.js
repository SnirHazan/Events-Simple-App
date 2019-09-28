const express = require('express');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const isAuth = require('./middleware/isAuth');

//Resolvers and Schema of GraphQL
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

//Create a server
const app = express();

//Add middlewares to app
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method == 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

//Check for auth
app.use(isAuth);

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

//Connecting to MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@events-app-si3zt.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(() => {
    console.log('Connected To MongoDB');
    app.listen(4000, () => {
      console.log('The Server Is Running On Port 4000');
    });
  })
  .catch(err => {
    console.log(err);
  });
