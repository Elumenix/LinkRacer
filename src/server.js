const http = require('http');
const url = require('url');
const querystring = require('querystring');

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
  if (pathname === '/node_modules/bootstrap/dist/css/bootstrap.min.css') {
    htmlHandler.getBootstrapCSS(request, response);
  }
  if (pathname === '/node_modules/bootstrap/dist/js/bootstrap.min.js') {
    htmlHandler.getBootstrapJs(request, response);
  }
  if (pathname === '/node_modules/jquery/dist/jquery.min.js') {
    htmlHandler.getJQuery(request, response);
  }
  if (pathname === '/updateRecents') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = querystring.parse(bodyString);

      wikiHandler.updateRecents(request, response, bodyParams);
    });
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
