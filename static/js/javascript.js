var map;
var placeInfoWindow;
var markers=[];
var htmlContentResult;
// init places
var placesMustBeVisitedInEgypt = [
  {
    name: 'The Great Pyramid at Giza',
    lat:  29.976480,
    lng:  31.131302,
    desc:'The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex bordering what is now El Giza, Egypt. It is the oldest of the Seven Wonders of the Ancient World, and the only one to remain largely intact'
  },
  {
    name: "Egyptian Museum",
    lat:30.0468749,
    lng:31.2320703,
    desc:"Extensive collection of Egyptian artifacts covering 5,000 years, including Tutankhamun's treasures."
  },
  {
    name:'Luxor City',
    lat: 25.6949741,
    lng: 32.624478,
    desc:'Luxor is a city on the east bank of the Nile River in southern Egypt. It is on the site of ancient Thebes, the pharaohs’ capital at the height of their power, during the 16th–11th centuries B.C. Todays city surrounds 2 huge, surviving ancient monuments: graceful Luxor Temple and Karnak Temple, a mile north. The royal tombs of the Valley of the Kings and the Valley of the Queens are on the river’s west bank.'
  },
  {
    name: 'Aswan',
    lat: 24.0923728,
    lng: 32.882662,
    desc: 'Aswan, a city on the Nile River, has been southern Egypt’s strategic and commercial gateway since antiquity. It contains significant archaeological sites like the Philae temple complex, on Agilkia Island near the landmark Aswan Dam. Philae’s ruins include the columned Temple of Isis, dating to the 4th century B.C. Downriver, Elephantine Island holds the Temple of Khnum, from the Third Dynasty.'

  },
  {
    name: 'Hurghada',
    lat: 27.192696,
    lng: 33.641625,
    desc: "Hurghada is a beach resort town stretching some 40km along Egypt’s Red Sea coast. It’s renowned for scuba diving, and has numerous dive shops and schools in its modern Sekalla district. There are many restaurants, bars and nightclubs, while the old town, El Dahar, is home to traditional Egyptian coffee shops and souks. Hurghada’s long stretch of sandy beach is lined with resort hotels."
  },
  {
    name: 'Sharm El-Sheikh',
    lat: 27.9653405,
    lng: 34.2124921,
    desc: "Sharm el-Sheikh is an Egyptian resort town between the desert of the Sinai Peninsula and the Red Sea. It's known for its sheltered sandy beaches, clear waters and coral reefs. Naama Bay, with a palm tree-lined promenade, is filled with bars and restaurants. Ras Muhammad National Park is a major diving destination, with marine life around the Shark and Yolanda reefs and the Thistlegorm wreck."
  } ];

// create our place model
var model = function(place){
  var self = this;
  this.name = place.name;
  this.lat = place.lat;
  this.lng = place.lng;
  this.desc = place.desc;
};

function ViewModel(){

 self.searchValue = ko.observable('');
 self.placesList = ko.observableArray([]);

 for (var i =0 ; i<placesMustBeVisitedInEgypt.length ; i++) {

   self.placesList.push(new model(placesMustBeVisitedInEgypt[i]));
 }
 map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 29.976480, lng:  31.131302},
  zoom: 6
  });

 placeInfoWindow = new google.maps.InfoWindow();
 initMarkers();


 self.searchResults = ko.computed( function() {
  var filter = self.searchValue().toLowerCase();
   // if search box is empty then show all the markers
   if (!filter) {

    markers.forEach(function(rec){
    rec.setMap(map);

    });

    return self.placesList();
  }
  else
  {
    var counter = 0 ;
    return ko.utils.arrayFilter(self.placesList(), function(rec) {
     //  filter places and return searchResult
     var filter = self.searchValue().toLowerCase();

     var string = rec.name.toLowerCase();

     var result = (string.search(filter) >= 0);
     marker = markers[counter];
     if (result === true){
      marker.setMap(map); // show only the filered marker
    }else{
      marker.setMap(null); // hide all marker
    }
    counter = counter + 1;

    return result;

  });

  }

}, self);
}

// init markers for all the 6 locations
function initMarkers(){

  var marker;

  for (var i = 0; i < placesMustBeVisitedInEgypt.length; i++) {
    var position = {lat: placesMustBeVisitedInEgypt[i].lat, lng: placesMustBeVisitedInEgypt[i].lng};
    var title = placesMustBeVisitedInEgypt[i].name;
    marker= new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
    });

    onMarkerClicked(marker);
    markers.push(marker);

  }

}
// listen for markers user click
function onMarkerClicked(marker){


  marker.addListener('click', function() {
    showPlaceInfoWindow(marker);

  });

}

function showPlaceInfoWindow(marker){

  // getty image is an api to load image for a place by its name
  // marker title is the place's name
  var url = "https://api.gettyimages.com/v3/search/images?fields=id,title,thumb,referral_destinations&sort_order=best&phrase="+marker.title;

  $.ajax({
    type: 'GET',
    url: url,
    processData: false,
    headers: {
      'Api-Key':'rg48rh8yf9j59v6e83mc79f4', // api key

    },

    success: function(result) {
     setTimeout(function() {
      marker.setAnimation(null);
    }, 2500);
     if (result) {
      var image =result.images[1].display_sizes[0].uri;
      // generating html
      htmlContentResult= '<div id="content">'+
      '<h1>'+marker.title+'</h1>'+
      '<div>'+
      '<p>'+placesMustBeVisitedInEgypt[marker.id].desc+'</p>'+
      '<img src='+image+" style = width:100%;>"+
      '</div>'+
      '</div>';
      placeInfoWindow.setContent(htmlContentResult);
      marker.setAnimation(google.maps.Animation.BOUNCE);


      placeInfoWindow.open(map,marker);

    }
    else
    {
      // generating html
      htmlContentResult = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHea  ding">'+marker.title+'</h1>'+
      '<div id="bodyContent">'+
      '<p>'+placesMustBeVisitedInEgypt[marker.id].desc+'</p>'+
      '<p> faile to load the image</p>'+
      '</div>'+
      '</div>';

      placeInfoWindow.setContent(htmlContentResult);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      placeInfoWindow.open(map, marker);
    }

  },
  error: function(XMLHttpRequest, textStatus, errorThrown) {
    handleError();
  }
});


}

function handleError() {
    alert("connection error");
}

function initMap(){
    ko.applyBindings(new ViewModel());
}

// listen for search result click
function onListItemClicked(name)
{
  var marker;
  for (i = 0; i < markers.length; i++) {
    if (markers[i].title == name){
      marker= markers[i];
    }
  }
  showPlaceInfoWindow(marker);
}