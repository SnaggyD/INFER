//CD: 11/10/2020 Updates:
//CD: 27/10/2020 - refactor

// New section  that extract propperties to a diction  (img id) use this to catalog images as final deliverable
// Sort on CLOUD_COVER_LAND
// To Do: filter collection on study area cloud cover
// Note: this code is the reference code.
// New Code Deployed to:
// 1. shp_Landsat4_TOA_Cloud_Browse
// 2. shp_Landsat5_TOA_Cloud_Browse
// 3. shp_Landsat4_SR_Cloud_Hist_Browse
// 4. shp_Landsat5_SR_Cloud_Hist_Browse

//CD: 28/11/2021 - Code cleanup for GitHUB _below

// Load Feature collection. Shape file of EPA lakes.
// This is a shapefile containing polygons of Irish Lakes. It is shared from the conordelaney account (to be fixed)
var table = ee.FeatureCollection("users/conordelaney/WFD_LakeSegment");

//Below are the parameters used to select the Lake polygon. This can be done via NAME or EDENLakeCo.  NAME can cause problems as it is not unique. 
// Note that the charsacters are found in some of the EDENCODES. This is how they are in the WFD_LakeSegment shapefile.
// NAME	EDENLakeCo
// Muckno ( Lough ) or Blayney Castle Lake	6000940280
// Owel ( Lough )	26001570260
// Dan ( Lough )	10001710070
// Egish ( Lough )	36001235970
// Knockaderry Reservoir	16001820070
// Sheelin ( Lough )	26001570690
// Pollaphuca Reservoir	9001680230
// Allen ( Lough )	260155a3000
// Currane (Lough)	21002130010
// Ramor ( Lough )	7001590600
// Derriana Lough	21002130120
// Gill ( Lough )	35001170040
	
// Feeagh ( Lough )	32001070070
// Furnace Lough	32001070030

// * Derg ( Lough )	250155b0450  
// * Ree ( Lough )	260155a0670
// * Conn (Lough)	34001100430
// * Mask ( Lough )	30001431410

// * Corrib Lower (Lough)	30001430390
// * Corrib Upper (Lough)	30001430570
// * Leane ( Lough )	22002070310

//Landsat4 '1982-08-01', '1993-12-31'
//Landsat5 '1984-03-01', '2012-06-01'
//Landsat7 '1999-01-01', '2003-04-01'
//Landsat8 '2013-04-01', '2019-04-01'

////////////// LANDSAT 7 
var landsat7Toa = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA');

// function to add Cloud Cover percentage for whole image as a band
var addCC = function(image) {
  return image.addBands(image.metadata('CLOUD_COVER_LAND'));
};

// function to add Cloud Cover percentage for whole image as a band
var addSCS = function(image) {
  return ee.Algorithms.Landsat.simpleCloudScore(image);
};

// This function adds a band representing the image timestamp.
var addTime = function(image) {
  return image.addBands(image.metadata('system:time_start'));
};

//Create Area Filter. Use NAME or EDENLakeCo to Select polygon for lake
var strStudyAreaName = "Ramor ( Lough )"
var StudyArea = table.filter(ee.Filter.eq("NAME","Ramor ( Lough )")).geometry();
//var StudyArea = table.filter(ee.Filter.eq("EDENLakeCo","7001590600")).geometry();

//The date range corresponds to the period before Landsat 7 failed.
var landsat7Toa = landsat7Toa.filterBounds(StudyArea)
    .filterDate('1999-01-01', '2003-04-01');

// This command filters the collection to one that only contains whole lake polygons i.e. the lake isn't split across multiple scenes.
landsat7Toa = landsat7Toa.filter(ee.Filter.contains({ leftField: '.geo', rightValue: StudyArea }));

// Call the functions that were set up above.
var landsat7Toa = landsat7Toa.map(addCC);   // Add Cloud Cover percentage for whole image as a band.
var landsat7Toa = landsat7Toa.map(addSCS);  // Calculate the Simple Cloud Score for each pixel and add it as a band.
var landsat7Toa = landsat7Toa.map(addTime); // Add the image timestamp as a band .

print ('The results collection:',landsat7Toa);

//CD: 11/10/2020 Code for extract properties from collection
//https://stackoverflow.com/questions/56354693/is-there-a-way-to-push-key-value-pairs-in-google-earth-engine-in-a-loop-that-is

// Extract the ID of each image object and set as property
// within for each image in the collection
var Collection = landsat7Toa.map(function(img) {
    var img_id = img.id();
    var id_slice = img_id.slice(-20);
    return img.set('id',id_slice);
});//end of map function

// Get the image IDs and names as lists from the collection
// The output order is wrong
var ids = ee.List(Collection.aggregate_array('id'));
var names = ee.List(Collection.aggregate_array('LANDSAT_PRODUCT_ID'));
var cloud = ee.List(Collection.aggregate_array('DATE_ACQUIRED'));

// Build dictionary from each image ID and name
var out_dict = ee.Dictionary.fromLists(ids,names);
print('Output Dictionary:',out_dict);

// END Code for extract properties from collection

// Extract data for chart, this has be band data.
// Cloud_Cover_Land is a metadata statistic provided with Landsat. Earlier we added it as band so we can use it here.  
// cloud is a band that is added by the rudimentary SimpleCloudScore algorithm for scoring Landsat pixels by their relative cloudiness. 
var chrtData = landsat7Toa.select(['CLOUD_COVER_LAND','cloud'],['For Image','For ROI']);

//Build Chart Object
// Average over the StudyArea
var tempTimeSeries = ui.Chart.image.series({
  imageCollection: chrtData,
  region: StudyArea,
  reducer: ee.Reducer.mean(),
  scale: 30
});

// Using scatter chart for convenience
tempTimeSeries.setChartType('ScatterChart');
tempTimeSeries.setOptions({
  title: 'Cloud Cover',
  vAxis: {
    title: 'Cloud cover (%)'
  },
  hAxis: {title: 'The Landsat 4 TOA Archive for ' + strStudyAreaName},
  legend: {position: 'bottom'},
  lineWidth: 1,
  pointSize: 4,
  series: {
    0: {color: '0000ff'},
    1: {color: '00ff00'}
  }
});

print('Graph of Results, click on point to see image:',tempTimeSeries);

// Sort by a cloud cover property, get the least cloudy image.
var image = ee.Image(landsat7Toa.sort('CLOUD_COVER_LAND').first());

// Define visualization parameters for image in an object literal. 
var vizParams = {bands: ['B3', 'B2', 'B1'], min: 0, max: 0.4, gamma: 1.2};

// Center the map on the image and display.
Map.centerObject(image, 9);
Map.addLayer(image, vizParams, 'Landsat 4 false color');
Map.addLayer(StudyArea, vizParams, 'Shapefile');

// Create a label on the map.
var label = ui.Label('Click a point on the chart to show the image for that date.');
Map.add(label);

// When the chart is clicked, update the map and label.
tempTimeSeries.onClick(function(xValue, yValue, seriesName) {
  if (!xValue) return;  // Selection was cleared.

  // Show the image for the clicked date.
  var equalDate = ee.Filter.equals('system:time_start', xValue);
  var image = ee.Image(landsat7Toa.filter(equalDate).first());
  var l8Layer = ui.Map.Layer(image, {
    gamma: 1.2,
    min: 0,
    max: 0.4,
    bands: ['B3', 'B2', 'B1']
  });
  
  Map.centerObject(image, 9);
  Map.layers().reset([l8Layer]);
  Map.addLayer(StudyArea, vizParams, strStudyAreaName);

  // Show a label with the date on the map.
  label.setValue((new Date(xValue)).toUTCString());
});


