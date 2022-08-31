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

    } finally {
        let quota = await client.getQuota();
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log(quota.storage.used, quota.storage.available)
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        console.log('------------------------------------------------------------------------------------------------------------------')
        lock.release();
    }

    // log out and close connection
    await client.logout();
};

main();