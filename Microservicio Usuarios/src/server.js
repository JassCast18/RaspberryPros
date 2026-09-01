require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Users service listening on port ${port}`);
});
