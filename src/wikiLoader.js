const getRandomPage = (request, response) => {
  fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary').then((recieved) => {
    if (recieved.ok) {
      return recieved.json();
    }

    throw new Error('API request failed');
  }).then((data) => {
    //console.log(data);
    response.writeHead(200, { 'Content-Type': request.headers.accept });

    let returnData = JSON.stringify(data);
    //console.log(returnData);

    response.write(returnData);
    response.end();
    return response;
  });
};

module.exports.getRandomPage = getRandomPage;
