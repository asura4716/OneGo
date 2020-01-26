'use strict';

const yelpApiKey = "PujIZIgI7cxHLz84besYxcEkJLhw2jjnJAZHDRph9MXX9KyRvmFjlBzpbqqEunYmxPM9St0fi7LMr-HCrtg5v5_7CGD8HJd7Yu0keLKE6kmM0BKvmTQLc_RgrTPLXXYx"; 
const yelpSearchUrl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search';
const yelpReviewUrl = 'https://api.yelp.com/v3/businesses/'

const ipgeoSearchUrl = 'https://api.ipgeolocation.io/ipgeo?apiKey=';
const ipgeoApiKey = "ec05f05d2f3e404eaa31e35f0367db34";
const ipUrl = ipgeoSearchUrl + ipgeoApiKey;



function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function mileConversion(meters) {
  let miles= meters/1609;
  return Math.floor(miles*100)/100;
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.businesses.length; i++){
    $('#results-list').append(
      `<li><h3>${responseJson.businesses[i].name}</h3>
      <p class="info categories">Categories: ${responseJson.businesses[i].categories[0].title}</p>
      <p class="info">Rating: ${responseJson.businesses[i].rating}/5</p>
      <p class="info distance">${mileConversion(responseJson.businesses[i].distance)} miles</p>
      <a href="${responseJson.businesses[i].url}" target="_blank"><img class="images" src='${responseJson.businesses[i].image_url}'></a>
      <a href="${responseJson.businesses[i].url}" target="_blank" class="yelpLink">Details</a>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};
  
function getYelpInfo(query, limit=20, radius=5) {
 // make sure the location info is returned before form is submitted to yelp;
  
  fetch(ipUrl, {
    method: 'get',
  }).then(function(response) {
    return response.json(); // pass the data as promise to next then block
  }).then(function(data) {
    let longitude = data.longitude;
    let latitude = data.latitude;

    console.log(longitude, '\n');
    console.log(latitude, '\n');

    const yelpParams = {
      term: query+" restaurant",
      longitude: longitude,
      latitude: latitude,
      radius,
      limit
    }

    const queryString = formatQueryParams(yelpParams)
    const yelpUrl = yelpSearchUrl + '?' + queryString;
    console.log(yelpUrl);
  
    fetch(yelpUrl, {
    method: "GET",
    headers: {
    "accept": "application/json",
    "x-requested-with": "xmlhttprequest",
    "Access-Control-Allow-Origin":"*",		
    "Authorization": "Bearer " + yelpApiKey}
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson, limit))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.description}`);
    })
  })};

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const limit = $('#js-max-limit').val();
    //mile to meter conversion
    const radius = $('#js-search-radius').val()*1609;
    getYelpInfo(searchTerm, limit, radius);
  });
}

$(watchForm);

var searchEx = [ 'Want some suggestions?', 'African', 'American', 'Belgian', 'Barbeque', 'Caribbean', 'Chilean', 'Filipino', 'Fondue', 'French', 'German', 'Italian', 'Japanese', 'Mediterranean', 'Peruvian', 'Steakhouse', 'Vegan', 'Yugoslav' ];
setInterval(function() {
  $("input#js-search-term").attr("placeholder", searchEx[searchEx.push(searchEx.shift())-1]);
  }, 3000);