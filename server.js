let http = require('http');
let fs = require('fs');
let path = require('path');


console.log("__dirname = " + __dirname);

let handleRequest = (request, response) => {
  /*
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  fs.readFile('./index.html', null, function (error, data) {
    if (error)
    {
      response.writeHead(404);
      respone.write('Whoops! File not found!');
    }
    else
    {
      response.write(data);
    }

    response.end();
    });
  */
  
  let filePath = '.' + request.url;

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname)
  {
    case '.js':
      contentType = 'text/javascript';
      break;

    case '.css':
      contentType = 'text/css';
      break;
  }

  if (filePath == './')
  {
    filePath = './index.html';
  }

  console.log("Request URL: " + filePath);

  fs.readFile(filePath, function(error, content) {
    if (error)
    {
      console.log(error);
    }
    else
    {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
};

http.createServer(handleRequest).listen(8080);
