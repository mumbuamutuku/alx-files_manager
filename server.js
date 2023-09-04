// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const routes = require('./routes');

// Middleware to parse JSON
app.use(express.json());

// Load routes from the routes folder
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
