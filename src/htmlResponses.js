const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const bootstrapCSS = fs.readFileSync(`${__dirname}/../node_modules/bootstrap/dist/css/bootstrap.min.css`);
const bootstrapJs = fs.readFileSync(`${__dirname}/../node_modules/bootstrap/dist/js/bootstrap.min.js`);
const jQuery = fs.readFileSync(`${__dirname}/../node_modules/jquery/dist/jquery.min.js`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getBootstrapJs = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(bootstrapJs);
  response.end();
};

const getBootstrapCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(bootstrapCSS);
  response.end();
};

const getJQuery = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(jQuery);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getCSS = getCSS;
module.exports.getBootstrapJs = getBootstrapJs;
module.exports.getBootstrapCSS = getBootstrapCSS;
module.exports.getJQuery = getJQuery;
