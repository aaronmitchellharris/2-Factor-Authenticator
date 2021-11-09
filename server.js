const express = require('express');
const oauth = require('./routes/2fa');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

app.use('/2fa', oauth);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});