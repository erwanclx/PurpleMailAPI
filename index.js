const { query } = require('express');
const express = require('express')
const app = express();
const { ImapFlow } = require("imapflow");
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')

/* Génération de token */

app.get('/token:host?:port?:secure?:user?:pass?', async (req, res) => {
  const { host, port, secure, user, pass } = req.query;
  
  let imapClient = new ImapFlow({
    host: host,
    port: port,
    secure: secure,
    auth: {
        user: user,
        pass: pass,
    }
  });
  try {
    await imapClient.connect();
  }
  catch (err) {
    throw err;
  }  
  finally {
    const token = jwt.sign({
        host: host,
        port: port,
        secure: secure,
        user: user,
        pass: pass
    }, 'SECRET', { expiresIn: '24 hours' })
    await imapClient.logout();
    return res.json({ access_token: token })
  }
})

/* Fin de Génération de token */

/* Récupération des dossiers */

app.get('/folder:token?', async (req,res) => {
  const { token } = req.query;
    token_credentials = jwt_decode(token);

    const main = async () => {

        const imapFlow = new ImapFlow({
          host: token_credentials.host,
          port: token_credentials.port,
          secure: token_credentials.secure,
          auth: {
              user: token_credentials.user,
              pass: token_credentials.pass,
          }
      });
      
        await imapFlow.connect();
        let list = await imapFlow.list();
        let folderList = []
        list.forEach(mailbox => folderList.push(mailbox.path));
        res.send(folderList)
    }
    main().catch(res.send);
})

/* Fin de récupération des dossiers */

/* Récupération des X derniers mails dans le dossier Y */
  app.get("/get:token?:folder?:toload?", async (req, res) => {
    const { folder, toload } = req.query;
    const { token } = req.query;
    token_credentials = jwt_decode(token);

    const main = async () => {

        const imapFlow = new ImapFlow({
          host: token_credentials.host,
          port: token_credentials.port,
          secure: token_credentials.secure,
          auth: {
              user: token_credentials.user,
              pass: token_credentials.pass,
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
