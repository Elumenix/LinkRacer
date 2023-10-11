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
  await getShortestPath(savedData.data1.title, savedData.data2.title);

  response.writeHead(200, { 'Content-Type': request.headers.accept });

  // Only pass starting page so it is loaded into the iframe
  const returnData = JSON.stringify({
    data: savedData.data1,
    state,
  });

  response.write(returnData);
  response.end();
  return response;
};

module.exports.getRandomPage = getRandomPage;
