const net = require('net');
const EventEmitter = require('events');

const auth = net.createConnection(8090, "0.0.0.0");
const channel = new EventEmitter();

let users = {};
let claimqueue = [];

auth.write(JSON.stringify({intent: "recieve"}));

net.createServer((c) => {
    const broadcast = (data) => {c.write(data)};
    channel.on('broadcast', broadcast);

    c.on('data', (data) => {
        try {
            data = JSON.parse(data.toString().trim());
            if(data.intent == "claim") {
                if(data.data == claimqueue[0]) {
                    console.log(`${data.data} Verified`);
                    c.id = data.data;
                    claimqueue.shift();
                }
            } else if(data.intent == "message") {
                if(c.id) {
                    channel.emit('broadcast', JSON.stringify({intent: "message", data: {from: c.id, content: data.data.trim()}}));
                    console.log(`[${c.id}] ${data.data}`);   
                }
            }
        } catch(error) {
            throw error
        }
    });

    c.on('close', () => {
        console.log(`[${c.id} exit]`);
        channel.removeListener('broadcast', broadcast);
    })
}).listen({host: '0.0.0.0',port: 8080}, () => {
    console.log("server started");
})

auth.on('data', (data) => {
    try {
        data = JSON.parse(data.toString().trim());
        claimqueue.unshift(data.id);
        console.log(`Added ${data.id} to user queue`);
    } catch(error) {
        throw error;
    }

})