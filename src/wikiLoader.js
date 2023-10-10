const state = {
  sourcePageTitle: '',
  targetPageTitle: '',
  paths: [],
  error: null,
};


const getShortestPath = () => {
  return new Promise((resolve, reject) => {
    // Test route
    state.sourcePageTitle = 'Danilo Lim';
    state.targetPageTitle = 'Usili Formation';

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
        //sourcePageTitle,
        //targetPageTitle,
        //isSourceRedirected,
        //isTargetRedirected,
      } = data;

      // pathsDenormalized is an array of paths instead of pageIds
      // Importantly, this lets me get the title and url of each page to give to the user
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
  })
};


const getRandomPage = async (request, response) => {
  await getShortestPath();

  fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary').then((recieved) => {
    if (recieved.ok) {
      return recieved.json();
    }

    throw new Error('API request failed');
  }).then((data) => {
    // console.log(data);
    response.writeHead(200, { 'Content-Type': request.headers.accept });

    const returnData = JSON.stringify({
      data: data,
      state: state
    });

    //console.log(returnData);

    response.write(returnData);
    response.end();
    return response;
  });
};


module.exports.getRandomPage = getRandomPage;
