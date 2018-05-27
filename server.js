const http = require('http');
const fs = require('fs');
const mime = require('mime');
const handlebars = require('handlebars');

const port = 3000;

const server = http.createServer((req, res) => {
  let method = req.method;
  let url = req.url;
  if(method === 'GET') {
    switch (url) {
      case '/':
        let sortedFiles = {};
        scanDirectory('./content', (err, result) => {
          result.forEach(file => {
            let ext = file.match(/(\.[a-z])*\.[a-z]+$/)[0].replace(/\./, '');
            //todo: refactor switch as a separate function
            switch (ext) {
              case 'js':
              case 'jsx':
                if(sortedFiles.javascript) {
                  sortedFiles.javascript.push(file);
                } else {
                  sortedFiles.javascript = [];
                  sortedFiles.javascript.push(file);
                }
                break;
              case 'ts':
              case 'tsx':
                if(sortedFiles.typescript) {
                  sortedFiles.typescript.push(file);
                } else {
                  sortedFiles.typescript = [];
                  sortedFiles.typescript.push(file);
                }
                break;
              case 'd.ts':
                if(sortedFiles.definition) {
                  sortedFiles.definition.push(file);
                } else {
                  sortedFiles.definition = [];
                  sortedFiles.definition.push(file);
                }
                break;
              case 'json':
              case 'yaml':
              case 'yml':
                if(sortedFiles.configuration) {
                  sortedFiles.configuration.push(file);
                } else {
                  sortedFiles.configuration = [];
                  sortedFiles.configuration.push(file);
                }
                break;
              case 'jpg':
              case 'jpeg':
              case 'png':
              case 'svg':
              case 'gif':
                let imgObj = {};
                let scale = file.match(/-x\d(?=\.\w{3,4})/);
                imgObj.path = file;
                if(scale) {
                  imgObj.scale = scale[0].replace('-', '');
                }

                if(sortedFiles.images) {
                  sortedFiles.images.push(imgObj);
                } else {
                  sortedFiles.images = [];
                  sortedFiles.images.push(imgObj);
                }
                break;
              case 'log':
                if(file.match(/logs\/\d{8}\//)) {
                  let fileObj = {};
                  let date = file.match(/\d{8}/)[0].slice(0, 4) + '-' + file.match(/\d{8}/)[0].slice(4, 6);
                  let stream = file.match(/stderr|stdout(?=\.log)/i);
                  fileObj.path = file;
                  if(stream) {
                    fileObj.stream = stream[0];
                  }

                  if(sortedFiles.logs) {
                    if(sortedFiles.logs[date]) {
                      sortedFiles.logs[date].push(fileObj);
                    } else {
                      sortedFiles.logs[date] = [];
                      sortedFiles.logs[date].push(fileObj);
                    }
                  } else {
                    sortedFiles.logs = {};
                    sortedFiles.logs[date] = [];
                    sortedFiles.logs[date].push(fileObj);
                  }
                } else {
                  if(sortedFiles.other) {
                    sortedFiles.other.push(file);
                  } else {
                    sortedFiles.other = [];
                    sortedFiles.other.push(file);
                  }
                }
                break;
              default:
                if(sortedFiles.other) {
                  sortedFiles.other.push(file);
                } else {
                  sortedFiles.other = [];
                  sortedFiles.other.push(file);
                }
            }
          });
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
        sendFile('./static/script.js');
        break;
      default:
        if(url.search(/\.[A-Za-z]+$/) !== -1) {
          let filePath = `content${url}`;
          sendFile(filePath);
        } else {
          res.writeHead(404, {"Content-Type": "text/plain"});
          res.write('404 not found');
          res.end();
        }
    }
  }

  function sendFile(path) {
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
});
server.listen(port);

console.log('server is running');


function scanDirectory(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if(err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if(!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if(stat && stat.isDirectory()) {
          scanDirectory(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file.replace(/.\/content\//, ''));
          next();
        }
      });
    })();
  });
}