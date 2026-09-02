require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT) || 3003;

app.listen(port, () => {
  console.log(`Sales service listening on port ${port}`);
});
