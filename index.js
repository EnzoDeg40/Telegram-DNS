require('dotenv').config();
const dns2 = require('dns2');
const TelegramBot = require('node-telegram-bot-api');

const { Packet } = dns2;

var records = [];
if (process.env.PERMANENT_RECORDS){
    records = JSON.parse(process.env.PERMANENT_RECORDS);
}

var tld = [
    ['peach', '🍑'],
    ['orange', '🍊'], 
    ['apple', '🍎'],
    ['banana', '🍌'], 
    ['pear', '🍐'] 
];

// Initalize Telegram Bot with token in .env file
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

// Function called when command /resolve is used
function resolveRecord(name) {
    // Check if the name is in the records
    const record = records.find(([recordName]) => recordName === name);
    if (record) {
        return record[1];
    }
    else{
        //return '1.1.1.1';
        return 'This record does not exists. Use /add to add it';
    }
}

// Function called when command /add is used
function createRecord(name, address) {
    // If name and address are not provided
    if(!name || !address){
        return [ false, `/add <name>.<tld> <address>\nExample: /add edstudio.peach 192.168.0.15\nUse /tdls to see the list of TLDs avaible`];
    }

    // Limit the size of the record to 64 characters
    if(name.length > 64){
        return [ false, 'The name is too long, please use a shorter name'];
    }

    // Limit the size of the record to 64 characters
    if(address.length > 64){
        return [ false, 'The address is too long, please use a shorter address'];
    }
    
    // Check if domain has only one dot
    if(name.split('.').length !== 2){
        return [false, "The record must have only one dot"];
    }

    // Check if domain has a valid TLD
    if(!tld.find(([tldName]) => tldName === name.split('.')[1])){
        return [false, "The record must have a valid TLD, check /tdls to see the list of valid TLDs"];
    }

    // Check if the name is in the records
    const record = records.find(([recordName]) => recordName === name);
    if (record) {
        return [false, "This record already exists. Use /resolve to get the address"];
    }

    // Check if address as only numbers and letters and dots
    if(!address.match(/^[a-zA-Z0-9.]+$/)){
        return [false, "invalid"];
    }

    // lowercase name and address
    name = name.toLowerCase();
    address = address.toLowerCase();

    // Record is valid, add it to the records
    records.push([name, address]);
    return [true, name + " added"];
}

// Function called when command /remove is used
// Bug in fonction
function removeRecord(name) {
    // Check if the name is in the records
    const record = records.find(([recordName]) => recordName === name);
    if (record) {
        records = records.filter(([recordName]) => recordName !== name);
        return name + " has removed from DNS";
    }
    else{
        return "This record does not exists. Check /list to see existing records.";
    }
}

function resolveMessage(message){
    const [command, name, address] = message.split(' ');

    // ADD
    if(command === '/add'){
        const [success, response] = createRecord(name, address);
        return response;
    }

    // REMOVE
    if(command === '/remove'){
        return removeRecord(name);
    }

    // TDLS
    if(command === '/tdls'){
        return "List of TDLs avaible :\n" + tld.map(([tldName, tldEmoji]) => `.${tldName} ${tldEmoji}`).join('\n');
    }

    // RESOLVE
    if(command === '/resolve'){
        return resolveRecord(name);
    }

    // LIST
    if(command === '/list'){
        // If list is empty
        if(records.length === 0){
            return "No records in the list. Use /add to add a record";
        }

        return records.map(([name, address]) => `${name} -> ${address}`).join('\n');
    }

    // RICKROLL
    if(command === '/rickroll'){
        return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }

    // HELP
    return `Commands:
        /add <name> <address> - Add a new record
        /resolve <name> - Resolve a record
        /list - List all records
        /help - Show this message`;
    
}

bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    bot.setMyCommands([
        { command: 'add', description: 'Add a new record' },
        { command: 'resolve', description: 'Resolve a record' },
        { command: 'list', description: 'List all records' },
        { command: 'help', description: 'Show this message' },
        { command: 'tdls', description: 'Show the list of TLDs' },
        { command: 'remove', description: 'Remove a record' },
        { command: 'rickroll', description: 'Rickroll' }
    ]);

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

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