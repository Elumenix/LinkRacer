const http = require('http');
const url = require('url');

const htmlHandler = require('./htmlResponses');
const wikiHandler = require('./wikiLoader');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const { pathname, query } = parsedUrl;
  console.log(request.method);

  if (!request.headers.accept.includes('application/json')) {
    request.headers.accept = 'application/json';
  }
  console.log(pathname);

  if (request.method == "HEAD") {
    response.writeHead(200, { 'Content-Type': request.headers.accept });

      let returnjson = {
        message: "You are successfully connecting to the server",
      }

      response.write(JSON.stringify(returnjson));
      response.end();
  }
  else {

    switch (pathname) {
      case '/':
        htmlHandler.getIndex(request, response);
        break;
      case '/randomPage':
        wikiHandler.getRandomPage(request, response);
        break;
      case '/style.css':
        htmlHandler.getCSS(request, response);
        break;
      case '/getRevised':
        wikiHandler.getRevisedUrl(request, response, query);
        break;
      case '/node_modules/bootstrap/dist/css/bootstrap.min.css':
        htmlHandler.getBootstrapCSS(request, response);
        break;
      case '/node_modules/bootstrap/dist/js/bootstrap.min.js':
        htmlHandler.getBootstrapJs(request, response);
        break;
      case '/node_modules/jquery/dist/jquery.min.js':
        htmlHandler.getJQuery(request, response);
        break;
      case '/updateRecents':
        const body = [];

        request.on('error', (err) => {
          console.dir(err);
          response.writeHead(400, { 'Content-Type': request.headers.accept });

          let returnjson = {
            message: err,
          }
          response.write(JSON.stringify(returnjson));
          response.end();
        });

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          const bodyString = Buffer.concat(body).toString();
          let bodyParams;

          try {
            bodyParams = JSON.parse(bodyString);
          }
          catch {
            response.writeHead(400, { 'Content-Type': request.headers.accept });

            let returnjson = {
              message: "Bad Request: Input JSON absent or not properly formatted.",
            }
            response.write(JSON.stringify(returnjson));
            response.end();
            return;
          }

          wikiHandler.updateRecents(request, response, bodyParams);
        });
        break;
      case '/getRecents':
        wikiHandler.getRecents(request, response);
        break;
      default:
        // notFound
        response.writeHead(404, { 'Content-Type': request.headers.accept });

        let returnjson = {
          message: "The endpoint could not be found",
        }
        response.write(JSON.stringify(returnjson));
        response.end();
    }
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
