const queryString = require('querystring');

const state = {
  sourcePageTitle: '',
  targetPageTitle: '',
  paths: [],
  error: null,
};


const previousSearches = [];


const getRecents = (request, response) => {
  const responseJSON = {
    previousGames: previousSearches,
  };

  response.writeHead(200, { 'Content-Type': request.headers.accept });
  response.write(JSON.stringify(responseJSON));
  response.end();
}

const updateRecents = (request, response, bodyParams) => {
  let responseCode = 204;

  if (previousSearches.length === 0) {
    responseCode = 201
  }


  // Insterts game at the beginning of the array
  previousSearches.unshift(bodyParams);

  // Limit to 5 games
  if (previousSearches.length > 5) {
    previousSearches.pop();
  }

  response.writeHead(responseCode, { 'Content-Type': request.headers.accept });

  if (responseCode === 201) {
    const responseJSON = {
      message: "Created Successfully",
    };

    response.write(JSON.stringify(responseJSON));
  }

  response.end();
}

const getShortestPath = (startingPage, endingPage) => new Promise((resolve, reject) => {
  // Test route
  state.sourcePageTitle = startingPage;
  state.targetPageTitle = endingPage;

  // Using an online websites api that can find the path between wikipedia pages
  fetch('https://api.sixdegreesofwikipedia.com/paths', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: state.sourcePageTitle,
      target: state.targetPageTitle,
    }),
  }).then((response) => response.json()).then((data) => {
    // Creating new variables via destructuring
    const {
      pages,
      paths,
      // sourcePageTitle,
      // targetPageTitle,
      // isSourceRedirected,
      // isTargetRedirected,
    } = data;

    console.log(startingPage);
    console.log(endingPage);

    // pathsDenormalized is an array of paths instead of pageIds
    // Importantly, this lets me get the title and url of each page to give to the user
    // If the page in question was first created after January 1, 2021,
    // then it won't be in the database, which would cause this assignment to crash the program.
    // I've handled this in the catch block of getrandompage
    const pathsDenormalized = paths.map((path) => path.map((pageId) => pages[pageId]));

    state.paths = pathsDenormalized;

    // This pathway was successful
    state.error = null;

    // Return promise
    resolve();
  }).catch((error) => {
    state.error = error;

    // reject the promise
    reject(state.error);
  });
});

const getRevisedUrl = async (request, response, query) => {
  const urlParams = queryString.parse(query);

  const params = {
    action: 'query',
    prop: 'revisions',
    titles: urlParams.title,
    rvlimit: '1',
    rvprop: 'ids|timestamp',
    rvdir: 'older',
    rvend: '2001-01-15T00:00:00Z',
    rvstart: '2021-01-01T00:00:00Z',
    format: 'json',
    formatversion: '2',
    origin: '*',
  };

  const searchString = new URLSearchParams(params).toString();

  let extensionUrl;

  // Fetch the data from the API
  await fetch(`https://en.wikipedia.org/w/api.php?${searchString}&redirects`)
    .then((confirmation) => confirmation.json())
    .then((data) => {
      // Extract the page ID (it's a key in the 'pages' object)
      const pageId = Object.keys(data.query.pages)[0];

      // Extract the revisions
      const { revisions } = data.query.pages[pageId];

      extensionUrl = `oldid=${revisions[0].revid}`;
    })
    .catch((error) => console.error(`Error: ${error}`));

  fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&${extensionUrl}&prop=text|displaytitle&redirects`).then((wikiResponse) => wikiResponse.json()).then((wikiHtml) => {
    const returnData = JSON.stringify({
      title: wikiHtml.parse.title,
      titlehtml: wikiHtml.parse.displaytitle,
      html: wikiHtml.parse.text,
    });

    // Return the data
    response.writeHead(200, { 'Content-Type': request.headers.accept });
    response.write(returnData);
    response.end();
  });
};

const getRandomPage = async (request, response) => {
  let savedData;

  // Get two random wikipedia pages
  await Promise.all([
    fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary?redirects'),
    fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary?redirects'),
  ])
    .then(([response1, response2]) => Promise.all([response1.json(), response2.json()]))
    .then(([data1, data2]) => {
      // Get data for the start and end page
      savedData = { data1, data2 };
    })
    .catch((error) => {
      // Handle any errors here
      console.error('Error:', error);
    });

  // Get potential pathways using the titles of each page
  await getShortestPath(savedData.data1.title, savedData.data2.title).catch(() => {
    // One of the random pages was created since the wikipedia database was last published
    // Start this group of methods all over again. This happens like 1 / 8 times
    console.log('#######################################################');
    console.log('Crisis averted! Article was created after the database. \nAttempting to fetch new articles.');
    console.log('#######################################################');

    return getRandomPage(request, response);
  });

  // This error check is only in cas getShortestPath failed initially
  if (!response.finished) {
    response.writeHead(200, { 'Content-Type': request.headers.accept });

    // Only pass starting page so it is loaded into the iframe
    const returnData = JSON.stringify({
      data: savedData.data1,
      endPage: savedData.data2,
      state,
    });

    response.write(returnData);
    response.end();
    return response;
  }

  return response;
};

module.exports.getRandomPage = getRandomPage;
module.exports.getRevisedUrl = getRevisedUrl;
module.exports.updateRecents = updateRecents;
module.exports.getRecents = getRecents;
