
class Server
{
    constructor()
    {
        const app = require('express')();
        const http = require('http');

        const server = http.createServer(app);

        this.io = require('socket.io')(server, {
            cors: {
              origin: "http://localhost:9000",
              methods: ["GET", "POST"]
            }
          });

        // Create listener
        this.io.on('connect', (client) => 
        {
            console.log(`user connected`)
            client.on('disconnect', () => 
            {
                console.log(`user disconnected`)
            })
        })

        server.listen(3000, () => {
            console.log(`Started server successfully! Listening for connections now.`);
        })

    }
}

// Run the server
const server = new Server();