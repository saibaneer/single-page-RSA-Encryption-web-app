const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const forge = require("node-forge");
const app = express();

const axios = require('axios');
const dotenv = require('dotenv').config();
// const {decryptMessageWithString} = require('./index.js');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')))

const decryptMessageWithString = (encryptedMessage, privateKeyPem) => {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const decryptedMessage = privateKey.decrypt(forge.util.decode64(encryptedMessage), 'RSA-OAEP', {
        md: forge.md.sha256.create(),
      });
      return decryptedMessage;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  };

const sendDiscordNotification = async (encryptedMessaage) => {
    try {
        const message = {
            content: `A decryption request was made with the following encrypted message:\n${encryptedMessaage}`
        }

        await axios.post(DISCORD_WEBHOOK_URL, message)
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
}


  app.post('/decrypt', async (req, res) => {
    const { encryptedMessage, privateKeyPem } = req.body;
    try {
      const decryptedMessage = decryptMessageWithString(encryptedMessage, privateKeyPem);
      await sendDiscordNotification(encryptedMessage);
      res.json({ decryptedMessage });
    } catch (error) {
      console.error('Error in /decrypt route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})