// const { ImapFlow } = require("imapflow");
// const fs = require('fs');

// const main = async () => {

//   const imapFlow = new ImapFlow({
//     host: 'imap.gmail.com',
//     port: '993',
//     secure: 'true',
//     auth: {
//         user: 'purplemailapi@gmail.com',
//         pass: 'oalliqmeyafafnrx',
//     }
// });

//   await imapFlow.connect();
//   try {
//     let mailbox = await imapFlow.mailboxOpen('INBOX');
//     // download body part nr '1.2' from latest message
//     let {meta, content} = await imapFlow.download('2', '2');
//     // content.pipe(fs.createWriteStream('test.html'));
//     console.log('------------------------------------------ OK ------------------------------------------')
//     content.pipe(console.log('ok'))
//     console.log('------------------------------------------ OK ------------------------------------------')

//   } catch (e) {
//     console.log(e);
//     await imapFlow.logout();
//   }

//   await imapFlow.logout();
// }

// main();

const { ImapFlow } = require('imapflow');
const simpleParser = require('mailparser').simpleParser;

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: '993',
  secure: 'true',
  auth: {
      user: 'purplemailapi@gmail.com',
      pass: 'oalliqmeyafafnrx',
  }
});

const main = async () => {
    // Wait until client connects and authorizes
    await client.connect();

    // Select and lock a mailbox. Throws if mailbox does not exist
    let lock = await client.getMailboxLock('INBOX');
    try {
        // fetch latest message source
        // client.mailbox includes information about currently selected mailbox
        // "exists" value is also the largest sequence number available in the mailbox
        const { meta, content } = await client.download('2', null, {uid: true});
        const parsed = await simpleParser(content);
        console.log('------------------------------------------ OK ------------------------------------------')
        console.log(parsed.html);
        console.log('------------------------------------------ OK ------------------------------------------')
    } finally {
        // Make sure lock is released, otherwise next `getMailboxLock()` never returns
        lock.release();
    }

    // log out and close connection
    await client.logout();
};

main().catch(err => console.error(err));