import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Types ---
interface InstagramCommentFrom {
  id: string;
  username: string;
  self_ig_scoped_id: string;
}

interface InstagramCommentMedia {
  id: string;
  media_product_type: string;
}

interface InstagramCommentValue {
  from: InstagramCommentFrom;
  media: InstagramCommentMedia;
  id: string;
  parent_id: string;
  text: string;
}

interface InstagramChange {
  field: string;
  value: InstagramCommentValue;
}

interface InstagramEntry {
  changes: InstagramChange[];
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Webhook Verification (GET)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Webhook Event Handler (POST)
app.post('/webhook', (req, res) => {
  const { object, entry } = req.body;

  if (object === 'instagram') {
    (entry as InstagramEntry[]).forEach((item: InstagramEntry) => {
      item.changes.forEach((change: InstagramChange) => {
        if (change.field === 'comments') {
          const value = change.value;
          const commentText = value.text;
          const commenterUsername = value.from?.username;
          const mediaId = value.media?.id;

          console.log('--- New Instagram Comment Event ---');
          console.log('Comment:', commentText);
          console.log('By User:', commenterUsername);
          console.log('On Post (Media ID):', mediaId);
          console.log('-------------------------------');
        } else {
          console.log('Other Instagram event:', change.field, change.value);
        }
      });
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
