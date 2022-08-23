
const express = require('express')
const cors = require("cors");
const app = express();
const { ImapFlow } = require("imapflow");
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode')
const simpleParser = require('mailparser').simpleParser;
const {decode} = require('html-entities');

/* Génération de token */

app.get('/token:host?:port?:secure?:user?:pass?',cors(), async (req, res) => {
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

app.get('/folder:token?',cors(), async (req,res) => {
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
  app.get("/getlasts:token?:folder?:toload?", cors(), async (req, res) => {
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
        { envelope: true }, {uid: true}
      )) {
        msg.envelope.uid = msg.uid;
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
/* Fin de récupération des X derniers mails dans le dossier Y */

/* Télécharger le corps du mail */

app.get("/message:token?:uid?", cors(),  async (req, res) => {
  const { token, uid } = req.query;
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
      let lock = await imapFlow.getMailboxLock('INBOX');
      try {
        const { meta, content } = await imapFlow.download(uid, null, {uid: true});
        const parsed = await simpleParser(content);
        const body = decode(parsed.html, {level: 'html5'})
        const from = parsed.from.value
        const to = parsed.to.value

        const mail_return = {
          from,
          to,
          body
        }

        res.json(mail_return);

        
        
        lock.release();
      } catch (e) {
        console.log(e);
        await imapFlow.logout();
      }
    
      await imapFlow.logout();
    }
    main().catch(res.send);
  });

/* Fin de télécharger le corps du mail */

/* Chercher mail */

app.get("/search:token?:folder?:search?:filter?", cors(), async (req, res) => {
  const { token, folder, search, filter } = req.query;
  token_credentials = jwt_decode(token);

  const main = async() => {
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
    let search_list = await imapFlow.search({[filter]: search}, {uid: true})
    res.send(search_list)
  }
  finally {
    lock.release();
    await imapFlow.logout();
  }
  await imapFlow.logout();
  }
  main().catch(res.send);
});

/* Fin de chercher mail */

/* Récupérer mail par UID a split avec , si plusieurs */

app.get("/getbyuid:token?:folder?:uid?", cors(), async (req, res) => {
  const { token, folder, uid } = req.query;
  token_credentials = jwt_decode(token);
  const main = async() => {
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
      for await (const msg of imapFlow.fetch(
        `${uid}`,
        { envelope: true }, {uid: true}
      )) {
        messages.push(msg.envelope);
      }
      res.send(messages);
          lock.release();
    }
    finally{
        lock.release()
        await imapFlow.logout()
    }
    await imapFlow.logout()
  }
  main().catch(res.send);
});

/* Fin récupérer mail par UID a split avec , si plusieurs */

app.listen(8080, () => {
    console.log(`Server on`)
})
