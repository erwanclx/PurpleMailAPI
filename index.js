const { query } = require('express');
const express = require('express')
const app = express()
const { ImapFlow } = require("imapflow");

// const imapFlow = new ImapFlow({
//     host: 'imap.gmail.com',
//     port: '993',
//     secure: 'true',
//     auth: {
//         user: 'purplemailapi@gmail.com',
//         pass: 'oalliqmeyafafnrx',
//     }
// });

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

/* Récupération des X derniers mails dans le dossier Y */

  app.get("/get:folder?:toload?", async (req, res) => {
    const main = async () => {
        const { folder, toload } = req.query;

        const imapFlow = new ImapFlow({
          host: 'imap.gmail.com',
          port: '993',
          secure: 'true',
          auth: {
              user: 'purplemailapi@gmail.com',
              pass: 'oalliqmeyafafnrx',
          }
      });
      
        await imapFlow.connect();
        let lock = await imapFlow.getMailboxLock(folder);
        try {
            const messages = [];

          const status = await imapFlow.status(folder, {
        messages: true
      });
  
      const mailToLoad = toload
        ? status.messages - toload + 1
        : status.messages - 9;
  
      for await (const msg of imapFlow.fetch(
        `${status.messages}:${mailToLoad}`,
        { envelope: true }
      )) {
        messages.push(msg.envelope);
      }
      res.send(messages.reverse());
          lock.release();
        } catch (e) {
          console.log(e);
          await imapFlow.logout();
        }
      
        await imapFlow.logout();
      }
      main().catch(res.send);
    });

/* Récupération des X derniers mails dans le dossier Y */

app.listen(8080, () => {
    console.log(`Server on`)
})
