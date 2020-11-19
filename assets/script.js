//zomato variables
var zomatoURL = "https://developers.zomato.com/api/v2.1/search?&sort=rating&q="
var zomatoKey = "121bbb71dd9ca77169dfb8af142d6e46"
var radius = "&radius=80"
//google variables
var map
var mapsURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" 
var GoogleKey = "&key=AIzaSyDuD7uhRf2B88H4rdS3LPR7JYbZSUlQnCI"
//globally declaring variables for user inputs of location and food type
var aPlace = ""
var foodType = ""
//starting lat and lng is sacramento we can change to user location later on
var latitude = 38.5816
var longitude = -121.4944
var userLat = ""
var userLng = ""
//globally delcaring variables
var infoWindow
var restaurantsArray = []
var zomatoArray = []
var results
var zomatoData = []
var image = "./assets/imgs/Restaurantforkandknifefreeicon2.png"
var imageZ = "./assets/imgs/Restaurantforkandknifefreeicon2Z.png"
var getDirectons = "https://www.google.com/maps/dir/"

//styles for map
var stylesArray = [
    {
        featureType: "poi",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ visibility: "on" }],
      },
  ]

function saveConditions() {
        if (savedCities.indexOf(aPlace) == -1) {
            savedCities.push(aPlace)
        }
}


//get users location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(changePosition);
  } 
}

//changes lat and lng
function changePosition(position) {
  userLat = position.coords.latitude 
  userLng = position.coords.longitude
  console.log(userLat, userLng)
}

//saves to local storage 
function savecity() {
    var str = JSON.stringify(savedCities)
    localStorage.setItem("cities", str)
}
//get citys from local storage 
function getCities() {
    var str = localStorage.getItem('cities')
    savedCities = JSON.parse(str)
    if (!savedCities) {
        savedCities = []
    }
}  

//compare results and if duplicate delete from arr2
function compareArrays(arr1, arr2) {
    console.log(arr1.length, arr2.length)
    for (var i = 0; i < arr2.length; i++){
        for (var j = 0; j < arr2.length; j++) {
                if(arr1[i] === arr2[j].name){ 
                    arr2.splice(j, 1)   
               }
        }
    }   
}

//print searched cities to navbar
function printCities(){
    $('#searchedCityList').empty()
    for(var i = 0; i < savedCities.length; i++) {
        var aSavedCity = $('<button class="pageLinks savedCity"></button>').text(savedCities[i])
        var listItem = $('<li></li>')
        aSavedCity.appendTo(listItem)
        listItem.appendTo('#searchedCityList')
    
    }
}

function savedCitySearch() {
    $('button.savedCity').on('click', function(){
        $('html').animate({
            scrollTop: $('.scroll').offset().top - 70
        }, 800);
        console.log("test")
        $('#location').val(this.textContent) 
    })
}



getLocation()
getCities()
printCities()
savedCitySearch()

//makes zomato call 2 times each time displaying the next 20 results so 40 results total
function zomatoCall() {
    var locSearch =  "&lat=" + latitude + "&lon=" + longitude
    //loops a total of 2 times
    for(var h = 0; h < 40; h = h + 20) {
        var iteratedResults = "&start=" + h
        //zomato call
        $.ajax({
            url: zomatoURL+ foodType + iteratedResults + locSearch,
            method: "get",
            headers: {
                "user-key": zomatoKey
            }
        }).then(function(response) {
            for (var i = 0; i < response.restaurants.length; i++){
                //create a data object for each resaurant
                var restuarantData = {
                    name: response.restaurants[i].restaurant.name,
                    cost: response.restaurants[i].restaurant.average_cost_for_two,
                    cuisines: response.restaurants[i].restaurant.cuisines,
                    highlights: response.restaurants[i].restaurant.highlights,
                    menu: response.restaurants[i].restaurant.menu_url,
                    timings: response.restaurants[i].restaurant.timings,
                    phone: response.restaurants[i].restaurant.phone_numbers,
                    photo: response.restaurants[i].restaurant.photos_url,
                    ratings: [response.restaurants[i].restaurant.aggregate_rating, response.restaurants[i].rating_text],
                    latitude: Number(response.restaurants[i].restaurant.location.latitude),
                    longitude: Number(response.restaurants[i].restaurant.location.longitude),
                    address: response.restaurants[i].restaurant.location.address
                    }
                zomatoData.push(restuarantData)
                zomatoArray.push(response.restaurants[i].restaurant.name)      
            }
            /*
            compareArrays(restaurantsArray, zomatoData)
            */          
            // compare restaurantsArray with zomatoArray. previously the restaurantsArray was compared with
            // zomatoData, which caused removal of Zomato icons. Test Case: Fox & Goose Public House, Sacramento
            compareArrays(restaurantsArray, zomatoArray)
        })      
    }
}

//map loads
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: latitude, lng: longitude},
        styles: stylesArray,
        zoom: 15
    });
    //creates search params
    var request = {
        location: {lat: latitude, lng: longitude},
        radius: '8000',
        type: ['restaurant'],
        keyword: foodType
    };
    
    infoWindow = new google.maps.InfoWindow()
    
    //google places call
    var service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, callback)
    
    //NEED TO set a timeout for google markers being generated to sync with zomato marker generation
    //returns all results and creates maker for that result
    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            restaurantsArray.push(results[i].name)
            }    
        }
    }
    
    //create a new zomato marker    
    function zomatoMarker(place){ 
        var highlights = []
        for (var i = 0; i < place.highlights.length; i++){
           var highlight = " " + place.highlights[i] 
           highlights.push(highlight)
        }
        console.log(highlights)
        var marker = new google.maps.Marker({
            map: map,
            position: {lat: place.latitude, lng: place.longitude},
            /*            
            icon: image
            */
            // imageZ is a transparent icon that is placed over the fork and knife icon. it prevents image
            // registration issues that otherwise occur if the Zomato API icon was placed near the
            // Google API icon, but misaligned by a number of pixels. though not visible, this icon is active.
            // it provides the restaurant infoWindow with information pulled from the Zomato API.
            icon: imageZ
        })
        google.maps.event.addListener(marker, 'click', function(){
            console.log(place)
            infoWindow.setContent(
            "<div class='restaurantInfo'>" +
               "<h4>" + place.name + "</h4>" +
               "<p>" + place.address + "</p>" + 
               "<p>" + "<a  target='_blank' href=" + '"' + 
               getDirectons + userLat + "+" + userLng + "/" + place.address + '"' + ">" + 
               "Get Directions" + "</a>" + "</p>" +
               "<p>" + "<a target='_blank' href=" + place.menu + ">" + "Menu" + "</a>" +
               "<p>" + "Average Cost for Two: " + place.cost + "</p>" +
               "<p>" + place.cuisines + "</p>" +               
               "<p>" + "Highlights: " + highlights + "</p>" +
               "<p>" + "Phone: " + place.phone + "</p>" +
               "<p>" + place.timings + "</p>") +
            "</div>"
            infoWindow.open(map, this)
        })
    }

    //creates a new google marker 
    function createMarker(place) {
        var placeLoc = place.geometry.location 
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: image,
        })
        
        //when a marker is clicked
        google.maps.event.addListener(marker, 'click', function(){
            //display info
            console.log(place)
            infoWindow.setContent(
                "<div class='restaurantInfo'>" +
                "<h4>" + place.name + "</h4>" + 
                "<p>" + place.vicinity + "</p>" + 
                "<p> Rating: " + place.rating + "</p>" +
                "<a  target='_blank' href=" + '"' + 
                getDirectons + userLat + "+" + userLng + "/" + place.vicinity 
                + '"' + ">" + "Get Directions" + "</a>" +
                "</div>"
                )
                
            infoWindow.open(map, this)
        })
    }

    zomatoCall()
        //time out to wait for return of zomato call
    setTimeout(function(){
            displayZomatoMarker()
    }, 2000)

    

    callback(results, status)

    function displayZomatoMarker() {
        //display zomato marker on map
        for(i = 0; i < zomatoData.length; i++) {
            zomatoMarker(zomatoData[i])
        }
        //reset zomato data
        zomatoData = []
    } 
}

//on click user input geocoded and latidtude and longitude variables reset
$('#search').on('click', function(e){
            e.preventDefault()

            //scroll to map
            $('html').animate({
                scrollTop: $('.scroll').offset().top - 70
            }, 800);
            console.log(zomatoData)
            restaurantsArray = []
            zomatoArray = []
            if ($('#location').val().trim() !== "") {
                aPlace = $('#location').val().trim()
            } else {
                return
            }
            foodType = $('#foodType').val().trim()
            console.log(foodType)

            saveConditions()
            savecity()
            printCities()

            $.ajax({
                url: mapsURL + aPlace + GoogleKey,
                method: "get"
            }).then(function(response) {
                latitude = response.results[0].geometry.location.lat
                longitude = response.results[0].geometry.location.lng
                //updates map with new lat lng and new markers
                initMap()   
                savedCitySearch() 
            });
});

