import { FileNode } from "@webcontainer/api";

export type FileTree = {
  [name: string]: FileNode;
}

export const Filesystem: FileTree = {
  "index.js": {
    file: {
      contents: `const express = require("express")

const app = express()
app.use(express.static('./'))

app.get("/hello", (req, res)=>{
    res.send("Hello world from /hello")
})

app.listen(8080, ()=> {
    console.log("App listening at localhost:8080")
})`,
    },
  },
  "package.json": {
      file: {
        contents: `{
  "name": "project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}`,
      }
    },
    "readme": {
      file: {
        contents: `Run nodejs in your browser with a vscode like editor. Running completely in your browser using webcontainers https://webcontainers.io/.

Get Started:
    1. Run the server type "npm run dev" then you can click "Open Browser" and see a hello world example page.
    2. Now you can click on index.html to what every you want and see it update when you switch back to the browser.
    3. Edit the index.js express server to what ever you want

Saving and loading Devboxs:
    To save your work you can press "Download Devbox" and that will download a box.boxfs file witch you can load by at any time by pressing Load devbox button.
    Loading a boxfs file will over ride any work you have.


Basic Expressjs functions:

Express docs: https://expressjs.com/

"const express = require("express)" This import express
"const app = expres()" this creates an express app

"app.get('/pathnane', (req, res) => {
    res.send('This is a test')
})" when some one go to the servers location /pathname the will get "This is a test sent back". "res.send()" sends text or other data the requester

"app.post('/pathnane', (req, res) => {
    res.send(req.body)
})" when some one does a http post to the location /pathname the will get back the body they sent. "res.send()" sends text or other data to the requester. "req.body" is a constent witch has the requests body

Limitation:
    1. The editor can only edit files on root dir
    2. Base enviroment only supports node.`,
      }
    },
    "index.html": {
      file: {
        contents: `<!DOCTYPE html>
<html>
  <head>
    <title>Web box</title>
  </head>
    <body>
      <h1>Hello world from wasm webcontainers</h1>
      <p>Project running on <pre id="location"></pre></p>
      <p>Go to <a href="/hello">/hello</a></p>
      <script>
        document.getElementById("location").innerText = window.location.href
      </script>
    </body>
</html>`,
      }
    }
}
