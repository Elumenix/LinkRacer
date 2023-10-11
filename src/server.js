const http = require('http');
// const url = require('url');
const htmlHandler = require('./htmlResponses');
const wikiHandler = require('./wikiLoader');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.log(request.url);

  if (request.url === '/') {
    htmlHandler.getIndex(request, response);
  }
  if (request.url === '/randomPage') {
    wikiHandler.getRandomPage(request, response);
  }
  if (request.url === '/style.css') {
    htmlHandler.getCSS(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
