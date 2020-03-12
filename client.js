#!/bin/node

const net = require('net');

const address = process.argv[2];
const user = process.argv[3];
const chat = net.createConnection(8080, address);
const auth = net.createConnection(8090, address);
process.stdin.resume();
process.stdin.setEncoding('utf8');

auth.write(JSON.stringify({intent: "register", data: {id: user, server: address}}));

chat.on('data', (data) => {
    try {
        data = JSON.parse(data.toString().trim()).data;
        console.log(`[${data.from}] ${data.content}`);
    } catch (error) {
        throw error;  
    }
})

auth.on('data', (data) => {
    try {
        data = JSON.parse(data.toString().trim());
        chat.write(JSON.stringify({intent: "claim", data: data.id}));   
    } catch (error) {
        throw error
    }
})

process.stdin.on('data', (chunk) => {
    process.stdout.write('\u001b[1A');
    process.stdout.write('\u001b[2K');
    chat.write(JSON.stringify({intent: "message", data: chunk}))
});
