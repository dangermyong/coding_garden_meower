const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/meower');
const mews = db.get('mews');
const filter = new Filter();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: 'Meower 🙀'
  });
});

app.get('/mews', (req, res) => {
  mews
    .find()
    .then(mews => {
      res.json(mews);
    })
});

function isValidMew(mew) {
  return mew.name && mew.name.toString().trim() !== '' && mew.content && mew.content.toString().trim() !== '';
}

app.post('/mews', (req, res) => {
  if(isValidMew(req.body)) {
    //insert into db...date
    const mew = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
      created: new Date()
    };

    mews
      .insert(mew)
      .then(createdMew => {
        res.json(createdMew);
      });
    console.log(mew);
    
  } else {
    console.log('err');
    res.status(422);
    res.json({
      message: 'Hey! Name and Content are required!'
    });
  }
});

app.listen(5000, () => {
  console.log('Listening on http://localhost:5000');
});