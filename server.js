require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/frontend'));
app.set('views', __dirname + '/frontend');

app.set('view engine', 'html');

const polly = new AWS.Polly({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

app.get('*', function (req, res) {
  res.render('index.html');
});

app.post('/speech', async (req, res) => {
  const text = req.body.Text;
  const { voiceId = 'Aditi', filename = 'speech.mp3', type = 'file', language = 'en-IN' } = req.query;

  try {
    const audio = await generatePollyAudio(text, voiceId, language);

    if (type === 'file') {
      const data = await writeAudioStreamToS3(audio.AudioStream, filename);
      res.send(data);
    } else if (type === 'stream') {
      res.send(audio.AudioStream);
    } else throw { errorCode: 400, error: 'Wrong type for output provided.' };
  } catch (e) {
    if (e.errorCode && e.error) res.status(e.errorCode).send(e.error);
    else res.status(500).send(e);
  }
});

// Generate audio from Polly and check if output is a Buffer
const generatePollyAudio = (text, voiceId, language) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceId,
    LanguageCode: language,
  };

  return polly
    .synthesizeSpeech(params)
    .promise()
    .then((audio) => {
      if (audio.AudioStream instanceof Buffer) return audio;
      else throw 'AudioStream is not a Buffer.';
    });
};

const writeAudioStreamToS3 = (audioStream, filename) => {
  return putObject('vadatiaws', filename, audioStream, 'audio/mp3').then((res) => {
    if (!res.ETag) throw res;
    else
      return {
        msg: 'File successfully generated.',
        ETag: res.ETag,
        url: `https://vadatiaws.s3.ap-south-1.amazonaws.com/${filename}`,
      };
  });
};

const putObject = (bucket, key, body, ContentType) => {
  return s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType,
    })
    .promise();
};

const server = app.listen(process.env.PORT || 5500, () => {
  const { port } = server.address();
  console.log('___________________________________');
  console.log(`Server running on PORT ${port}`);
  console.log(`Text to speech server start`);
  console.log('___________________________________');
});
