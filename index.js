require('dotenv').config();
const dns2 = require('dns2');
const TelegramBot = require('node-telegram-bot-api');

const { Packet } = dns2;


var records = [];

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const dns = dns2.createServer({
    udp: true,
    handle: (request, send, rinfo) => {
        const response = Packet.createResponseFromRequest(request);
        const [question] = request.questions;
        const { name } = question;
        response.answers.push({
            name,
            type: Packet.TYPE.A,
            class: Packet.CLASS.IN,
            ttl: 300,
            address: resolveName(name)
        });
        send(response);
    }
});

function resolveRecord(name) {
    // Check if the name is in the records
    const record = records.find(([recordName]) => recordName === name);
    if (record) {
        return record[1];
    }
    else{
        return '1.1.1.1';
    }
}

function createRecord(name, address) {
    // Check if the name is in the records
    const record = records.find(([recordName]) => recordName === name);
    if (record) {
        return false;
    }
    else{
        records.push([name, address]);
        return true;
    }
}

function resolveMessage(message){
    const [command, name, address] = message.split(' ');
    
    // ADD
    if(command === '/add'){
        if(createRecord(name, address)){
            return `Record ${name} added with address ${address}`;
        }
        else{
            return `Record ${name} already exists`;
        }
    }

    // RESOLVE
    else if(command === '/resolve'){
        return resolveRecord(name);
    }

    // LIST
    else if(command === '/list'){
        return records.map(([name, address]) => `${name} -> ${address}`).join('\n');
    }

    // HELP
    else if(command === '/help'){
        return `Commands:
        /add <name> <address> - Add a new record
        /resolve <name> - Resolve a record
        /list - List all records
        /help - Show this message`;
    }
    
    // END
    else{
        return 'Invalid command';
    }
}

bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    bot.setMyCommands([
        { command: '/add', description: 'Add a new record'},
        { command: '/resolve', description: 'Resolve a record'},
        { command: '/list', description: 'List all records' },
        { command: '/help', description: 'Show this message' }
    ]);

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

/*bot.setMyCommands([
    { command: '/add', description: 'Add a new record' },
    { command: '/resolve', description: 'Resolve a record' },
    { command: '/list', description: 'List all records' },
    { command: '/help', description: 'Show this message' },
]);*/

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    console.log(msg.text);

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, resolveMessage(msg.text));
});

dns.on('request', (request, response, rinfo) => {
    console.log(request.header.id, request.questions[0]);
});

dns.on('requestError', (error) => {
    console.log('Client sent an invalid request', error);
});

dns.on('listening', () => {
    console.log(dns.addresses());
});

dns.on('close', () => {
    console.log('dns closed');
});

dns.listen(53);

/*dns.listen({
    udp: {
        port: 5333,
        type: "udp4",  
    },
    tcp: {
        port: 5333,
    },
});*/

// eventually
//dns.close();