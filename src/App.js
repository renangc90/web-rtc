const express = require('express')
const app = express()
const http = require('http').createServer(app)
require('./SocketService')(http)

class App {
    constructor(port) {
        this.port = port ? port : 3000
    }

    start() {
        app.use(express.json())
        // app.get('/health', (req, res) => {
        //     res.send({
        //         status: 'UP'
        //     })
        // })
        
        //app.use(express.static('public'))
        app.use('/', (req, res) => {
            res.send('Hello World!');
        });
                
        http.listen(this.port, () => {
            console.log(`server up at port: ${this.port}`)
        })
    }
}

module.exports = (port) => {
    return new App(port)
}