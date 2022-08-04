const { query } = require('express');
const express = require('express')
const app = express()
const { ImapFlow } = require("imapflow");

const imap_credentials_example = new ImapFlow({
    host: 'imap.gmail.com',
    port: '993',
    tls: 'true',
    auth: {
        user: 'erwanclou@gmail.com',
        pass: 'miywvzcrxygzexzp',
    },
    logger: false,
});

/* Connexion à la boite mail via route */

app.get('/config', (req,res) => {

const { email, password, host, port, secure } = req.query;
 
const imap_credentials = new ImapFlow({
    host: host,
    port: port,
    tls: secure,
    auth: {
        user: email,
        pass: password,
    },
    logger: false,
});

// res.send(imap_credentials)

async function main() {
    try {
      await imap_credentials.connect();
      res.send("Credentials OK")
    } catch (err) {
      res.send('Credentials ERROR');
      throw err;
    }  
    await imap_credentials.logout();
  }
  
  main().catch(res.send);
})

/* Fin de connexion à la boite mail via route */

/* Récupération des dossiers */

app.get('/folder', (req,res) => {
    async function main() {
        await imap_credentials_example.connect();
        let list = await imap_credentials_example.list();
        let folderList = []
        list.forEach(mailbox => folderList.push(mailbox.path));
        res.send(folderList)
    }
    main().catch(res.send);
})

/* Fin de récupération des dossiers */

/* Récupération des X derniers mails */

app.get('/get:folder?:toload?', (req,res) => {
    async function main() {
        await imap_credentials_example.connect();
        const { folder, toload } = req.query;
        await imap_credentials_example.mailboxOpen(folder);
    let messages = [];
    let status = await imap_credentials_example.status(folder, {messages: true});
    if (toload) {
        var mailToLoad = status.messages - toload + 1;
    }
    else {
        var mailToLoad = status.messages - 9;
    }
    for await (let msg of imap_credentials_example.fetch(`${status.messages}:${mailToLoad}`, {envelope: true,})) {
        messages.push(msg.envelope)
  }
  res.send(messages.reverse())
}

main().catch(res.send);
})

/* Récupération des X derniers mails */


app.listen(8080, () => {
    console.log(`Server on`)
})
