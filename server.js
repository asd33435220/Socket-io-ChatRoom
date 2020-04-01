const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io').listen(server).sockets
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
let connectUserList = [];
let msgList = []
io.on("connection", socket => {
    console.log("用户连接成功");
    let userName = ''
    updateUserName();
    socket.on('login', (username, callback) => {
        if (username.trim().length === 0 || connectUserList.indexOf(username) != -1) {
            console.log('重名')
            return
        }
        userName = username
        connectUserList.push(userName)
        callback(true)
        updateUserName();
    })
    socket.on('chat message', msg => {
        console.log('有消息添加')
        msgList.push(msg)
        let thismsg = msg
        updateMsg(thismsg)
    })
    socket.on("disconnect", () => {
        console.log("用户断开连接");
        connectUserList.splice(connectUserList.indexOf(userName), 1)
        updateUserName();

    })
    function updateUserName() {
        io.emit('loadUser', connectUserList)
    }
    function updateMsg(thismsg) {
        if (msgList.length > 0 && userName != "") {
            io.emit('loadMsg', {
                name: userName,
                msg: thismsg
            })
        }
    }
})

const port = process.env.port || 5000;
server.listen(port, () => {
    console.log("服务器启动成功");
})