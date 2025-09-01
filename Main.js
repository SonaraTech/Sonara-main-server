const http = require('http');

require('dotenv').config();

const port = process.env.PORT || 1000;

let Sessions = new Map();

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Go
    if (req.method === 'POST' && req.url === '/desktop/Go') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const Email = body;

            fetch('https://sigmail-gic3.onrender.com/api/codeConfirm', {
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    to: Email,
                    senter: 'Sonara'
                })
            })
                .then(response => response.text())
                .then(data => Sessions.set(Email, data));

            res.writeHead(200);
            res.end();
            return;
        });
        return;
    }

    // Sign
    if (req.method === 'POST' && req.url === '/SignIn') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            let CheckEmail, CheckLogin, CheckPassword;
            const { Email, Login, Password } = JSON.parse(body);

            fetch(`${process.env.database}Data.json?orderBy="Name"&equalTo="${Login}"`)
                .then(response => response.json())
                .then(data => {
                    PersonalId = Object.keys(data)[0];

                    CheckEmail = data[PersonalId].Email;
                    CheckLogin = data[PersonalId].Login;
                    CheckPass = data[PersonalId].Pass;

                    if (CheckEmail !== Email) {
                        res.writeHead(401);
                        res.end();
                    }
                    else if (CheckLogin !== Login) {
                        res.writeHead(401);
                        res.end();
                    }
                    else if (CheckPassword !== Password) {
                        res.writeHead(401);
                        res.end();
                    }
                    else {
                        res.writeHead(200);
                        res.end();
                    }
                });
        });
    }

    if (req.method === 'POST' && req.url === '/SignUp') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { Email, Login, Password } = JSON.parse(body);

            fetch(`${process.env.database}Data.json`, {
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    Email: Email,
                    Login: Login,
                    Password: Password
                })
            })
                .then(response => {
                    if (response.ok) {
                        res.writeHead(200);
                        res.end();
                    }
                    else {
                        res.writeHead(500);
                        res.end();
                    }
                });
        });
    }

    // Confirm
    if (req.method === 'POST' && req.url === '/Confirm') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { Email, Code } = JSON.parse(body);
            const TrueCode = Sessions.get(Email);

            if (TrueCode === Code) {
                Sessions.delete(Email);

                fetch(`${process.env.database}Data.json?orderBy="Email"&equalTo="${Email}"`)
                    .then(response => response.json)
                    .then(data => {
                        if (Object.keys(data).length > 0) {
                            res.writeHead(200, {'Content-Type':'text/plain'});
                            res.end('Found');
                        }
                        else {
                            res.writeHead(200, {'Content-Type':'text/plain'});
                            res.end('New');
                        }
                    });
            }
            else {
                res.writeHead(401);
                res.end();
            }
            return;
        });
        return;
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log('> Successful start');
});