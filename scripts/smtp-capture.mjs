// Private integration-test SMTP sink. Never forwards messages to a recipient.
import net from 'node:net';
import fs from 'node:fs';
let sequence = 0;
net.createServer((socket) => {
  let buffer = '', data = null;
  const reply = (line) => socket.write(line + '\r\n');
  reply('220 email-preview.local ESMTP');
  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    let end;
    while ((end = buffer.indexOf('\r\n')) !== -1) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (data !== null) {
        if (line === '.') {
          fs.writeFileSync(`/capture/message-${String(++sequence).padStart(3, '0')}.eml`, data.join('\r\n') + '\r\n', { mode: 0o600 });
          data = null;
          reply('250 Message captured for test only');
        } else data.push(line.startsWith('..') ? line.slice(1) : line);
      } else if (/^(EHLO|HELO)/i.test(line)) {
        reply('250-email-preview.local');
        reply('250 8BITMIME');
      } else if (line.toUpperCase() === 'DATA') {
        data = [];
        reply('354 End data with <CRLF>.<CRLF>');
      } else if (line.toUpperCase() === 'QUIT') {
        socket.end('221 Bye\r\n');
      } else reply('250 OK');
    }
  });
  socket.on('error', () => {});
}).listen(2525, '0.0.0.0');
