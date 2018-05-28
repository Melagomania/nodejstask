const http = require('http');
const fs = require('fs');
const mime = require('mime');
const handlebars = require('handlebars');
const sortFiles = require('./modules/sortFiles/sortFiles');
const  scanDir = require('./modules/scanDir/scanDir');

const port = 3000;

const server = http.createServer((req, res) => {
  let method = req.method;
  let url = decodeURI(req.url);
  if(method === 'GET') {
    switch (url) {
      case '/':
        scanDir('./content', (err, result) => {
          if(err) throw err;
          let sortedFiles = sortFiles(result);
          fs.readFile('./static/index.hbs', (error, file) => {
            if(!error) {
              let template = handlebars.compile(file.toString());
              let html = template(sortedFiles);

              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(html);
              res.end();
            } else {
              if(error.code === 'ENOENT') {
                res.writeHead(404);
              } else {
                res.writeHead(500);
              }
              res.end();
            }
          });
        });
        break;
      case '/script.js':
        sendFile('./static/script.js', res);
        break;
      case '/style.css':
        sendFile('./static/style.css', res);
        break;
      default:
        if(url.search(/\.[A-Za-z]+$/) !== -1) {
          let filePath = `content${url}`;
          sendFile(filePath, res);
        } else {
          res.writeHead(404, {"Content-Type": "text/plain"});
          res.write('404 not found');
          res.end();
        }
    }
  } else if(method === 'DELETE') {
    if(url.match(/^\/([A-zА-я-_0-9]+\/)*[A-zА-я0-9-_]+(\.[A-z]+)+$/)) {
      fs.unlink('./' + url, err => {
        if(err) throw err;
        res.writeHead(200);
        res.end();
      });
    }
  }
});
server.listen(port);


function sendFile(path, res) {
  let fileType = mime.getType(path);
  fs.readFile(path, (error, file) => {
    if(!error) {
      res.writeHead(200, {'Content-Type': fileType});
      res.write(file);
      res.end();
    } else {
      if(error.code === 'ENOENT') {
        res.writeHead(404);
      } else {
        res.writeHead(500);
      }
      res.end();
    }
  });
}

console.log('server is running');


