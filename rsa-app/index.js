const fs = require("fs");
const path = require("path");
const forge = require("node-forge");

const generateKeyPair = () => {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

  const privateKeyObject = forge.pki.privateKeyToPem(privateKey);
  const publicKeyObject = forge.pki.publicKeyToPem(publicKey);

  const privateKeyPath = path.resolve(__dirname, "private_key.pem");
  const publicKeyPath = path.resolve(__dirname, "public_key.pem");

  fs.writeFileSync(privateKeyPath, privateKeyObject, { encoding: "utf-8" });
  fs.writeFileSync(publicKeyPath, publicKeyObject, { encoding: "utf-8" });

  console.log("Keys generated and saved to root directory");
};

const encryptMessage = (message) => {
  const publicKeyObject = fs.readFileSync(
    path.resolve(__dirname, "public_key.pem"),
    { encoding: "utf-8" }
  );
  const publicKey = forge.pki.publicKeyFromPem(publicKeyObject);

  const encryptedMessage = publicKey.encrypt(message, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  return forge.util.encode64(encryptedMessage);
};

const decryptMessage = (encryptedMessage) => {
  const privateKeyObject = fs.readFileSync(
    path.resolve(__dirname, "private_key.pem"),
    { encoding: "utf-8" }
  );
  const privateKey = forge.pki.privateKeyFromPem(privateKeyObject);

  const decryptedMessage = privateKey.decrypt(
    forge.util.decode64(encryptedMessage),
    "RSA-OAEP",
    { md: forge.md.sha256.create() }
  );
  return decryptedMessage;
};


const decryptMessageWithString = (encryptedMessage, privateKeyPem) => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    const decryptedMessage = privateKey.decrypt(forge.util.decode64(encryptedMessage), "RSA-OAEP", { md: forge.md.sha256.create()})
    return decryptedMessage;
}

const main = () => {
  generateKeyPair();

  const message = "You are annoying! \n https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjJzZjY4eHEzeGs4cmRlNmdnOGM5dndka3p2MzdwYzN3NGtwcDNjNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HdbgCWMu4p9DymYV8C/giphy.gif";
  const encryptedMessage = encryptMessage(message);
  console.log("Encrypted message:", encryptedMessage);
  console.log("\n")

  const decryptedMessage = decryptMessage(encryptedMessage);
  console.log("Decrypted message:", decryptedMessage);
  console.log("\n")

  const privateKeyPem = fs.readFileSync(path.resolve(__dirname, 'private_key.pem'), { encoding: 'utf8' });
    const decryptedMessageFromString = decryptMessageWithString(encryptedMessage, privateKeyPem);
    console.log('Decrypted message from string:', decryptedMessageFromString);
};



main();