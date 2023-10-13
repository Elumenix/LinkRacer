const queryString = require('querystring');

const state = {
  sourcePageTitle: '',
  targetPageTitle: '',
  paths: [],
  error: null,
};

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

    // pathsDenormalized is an array of paths instead of pageIds
    // Importantly, this lets me get the title and url of each page to give to the user

    console.log(startingPage);
    console.log(endingPage);

    const pathsDenormalized = paths.map((path) => path.map((pageId) => pages[pageId]));

    state.paths = pathsDenormalized;

    // This pathway was successful
    state.error = null;

    // Return promise
    resolve();
  }).catch((error) => {
    state.error = error;
    console.log(state.error);

    // reject the promise
    reject(state.error);
  });
});

const getRevisedUrl = (request, response, query) => {
  const urlParams = queryString.parse(query);
  console.log(urlParams);

  const params = {
    action: "query",
    prop: "revisions",
    titles: urlParams.title,
    rvlimit: "1",
    rvprop: "ids|timestamp",
    rvdir: "older",
    rvend: "2001-01-15T00:00:00Z",
    rvstart: "2021-01-01T00:00:00Z",
    format: "json",
    formatversion: "2",
    origin: "*"
  }

  const searchString = new URLSearchParams(params).toString();

  // Fetch the data from the API
  fetch(`https://en.wikipedia.org/w/api.php?${searchString}`)
    .then((confirmation) => confirmation.json())
    .then((data) => {
      // Extract the page ID (it's a key in the 'pages' object)
      const pageId = Object.keys(data.query.pages)[0];

      // Extract the revisions
      const { revisions } = data.query.pages[pageId];

      const fullUrl = `oldid=${revisions[0].revid}`;

      const returnData = JSON.stringify({
        urlExtension: fullUrl
      });

      // Return the data
      response.writeHead(200, { 'Content-Type': request.headers.accept });
      response.write(returnData);
      response.end();
    })
    .catch((error) => console.error(`Error: ${error}`));
};

const getRandomPage = async (request, response) => {
  let savedData;

  // Get two random wikipedia pages
  await Promise.all([
    fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary'),
    fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary'),
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
