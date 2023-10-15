const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses');
const wikiHandler = require('./wikiLoader');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const { pathname, query } = url.parse(request.url);
  console.log(pathname);

  if (pathname === '/') {
    htmlHandler.getIndex(request, response);
  }
  if (pathname === '/randomPage') {
    wikiHandler.getRandomPage(request, response);
  }
  if (pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  }
  if (pathname === '/getRevised') {
    wikiHandler.getRevisedUrl(request, response, query);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
