const net = require('net');
const crypto = require('crypto');
const EventEmitter = require('events');

const channel = new EventEmitter();

let auth = {};
let servers = {};

net.createServer((c) => {

    c.on('data', (data) => {
        try {
            console.log(data.toString().trim());
            data = JSON.parse(data.toString().trim());
            if(data.intent == "recieve") {
                console.log(`New server registered at ${c.remoteAddress}`);
                servers[c.remoteAddress] = c;
            } else {
                let hash = crypto.createHash('sha256').update(data.data.id).digest('hex');
                servers[data.data.server].write(JSON.stringify({id: hash}));
                c.write(JSON.stringify({id: hash}));
            }
        } catch (error) {
            throw error;
        }
    });

    c.on('close', () => {
        if(servers[c.remoteAddress]) {
            delete servers[c.remoteAddress];
        }
    })
}).listen(8090, () => {
    console.log("Auth server started");
})