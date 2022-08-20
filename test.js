const { ImapFlow } = require("imapflow");

const main = async () => {

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
  let lock = await imapFlow.getMailboxLock("INBOX");
  try {
    let data = await imapFlow.fetchOne(
      id,
      { source: true, labels: true, flags: true },
      { uid: true }
    );
    mail = {
      uid: data.uid,
      decoded: await simpleParser(data.source),
    };
    lock.release();
  } catch (e) {
    console.log(e);
    await imapFlow.logout();
  }

  await imapFlow.logout();

  
console.log('-----------------------');
console.log('-----------------------');
console.log('-----------------------');
console.log('-----------------------');
console.log('----------OK-----------');
console.log('-----------------------');
console.log('-----------------------');
console.log('-----------------------');
console.log('-----------------------');
}

main();
main();
main();
main();