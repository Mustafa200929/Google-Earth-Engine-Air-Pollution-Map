
var aoi = sg_adm
Map.addLayer(aoi, {}, 'AOI - Singapore');
Map.centerObject(aoi, 11);

// Section 0 ///////////////////////////////////////////////////////////////////
// Get the collection of air pollutants from Sentinel 5 dataset

// Cloud contaminate the measurements of air pollutant concentrations. 
// Define function to exclude cloudy pixels.
function maskClouds(image){
   // Get the cloud fraction band of the image.
   var cf=image.select('cloud_fraction');
   // Create a mask using 0.3 threshold.
   var mask=cf.lte(0.3); // mask out pixels with a cloud fraction above 0.3 (i.e., 30% cloud cover)
   // Return a masked image.
   return image.updateMask(mask).copyProperties(image);
}

// air pollution collection

//Atmospheric sulfur dioxide (SO2) concentrations
var collection_so2 = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_SO2')
  // Filter for images intersecting our area of interest.
  .filterBounds(aoi)
  // Map the cloud masking function over the image collection.
  .map(maskClouds)
  .select('SO2_column_number_density')
 

//Atmospheric nitrogen dioxide (NO2) concentrations
var collection_no2 = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2')
  // Filter for images intersecting our area of interest.
  .filterBounds(aoi)
  // Map the cloud masking function over the image collection.
  .map(maskClouds)
  .select('tropospheric_NO2_column_number_density');

//Atmospheric carbon monoxide (CO) concentration
var collection_co = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_CO')
  // Filter for images intersecting our area of interest.
  .filterBounds(aoi)
  .select('CO_column_number_density');

// Air pollution to analyse, so2, no2, co, 
// Map visualisation parameter

var pollutionCollection1 = collection_so2; ////////////////// set options ///////////////
var pollutionType1 = 'so2';                                       
var viz1 = so2VisParam;//coVisParam;//no2VisParam; //so2VisParam;   

var pollutionCollection2 = collection_no2;                       
var pollutionType2 = 'no2';                                       
var viz2 = no2VisParam;//coVisParam;//no2VisParam; //so2VisParam;  

var pollutionCollection3 = collection_co;                     
var pollutionType3 = 'co';                                       
var viz3 = coVisParam;//coVisParam;//no2VisParam; //so2VisParam;   

// Get the band name for the first feature of tehe                        
var bandName1 = pollutionCollection1.first().bandNames().get(0);        
print('bandnames', pollutionCollection1.first().bandNames().get(0));

var bandName2 = pollutionCollection2.first().bandNames().get(0);        
print('bandnames', pollutionCollection2.first().bandNames().get(0));

var bandName3 = pollutionCollection3.first().bandNames().get(0);        
print('bandnames', pollutionCollection3.first().bandNames().get(0));

// Section 1 ///////////////////////////////////////////////////////////////////////////////////////

// Create a median composite for 2023
var pollutionMedian1=pollutionCollection1.filterDate('2023-01-01', '2024-01-01')
.median();
var pollutionMedian2=pollutionCollection2.filterDate('2023-01-01', '2024-01-01')
.median();
var pollutionMedian3=pollutionCollection3.filterDate('2023-01-01', '2024-01-01')
.median();

// Clip it to your area of interest (only necessary for visualization purposes).
Map.addLayer(pollutionMedian1.clip(aoi), viz1, 'median '+ pollutionType1+' year 2023');
Map.addLayer(pollutionMedian2.clip(aoi), viz2, 'median '+ pollutionType2+' year 2023');
Map.addLayer(pollutionMedian3.clip(aoi), viz3, 'median '+ pollutionType3+' year 2023');
// Section 2 ///////////////////////////////////////////////////////////////////////////////////////

// Define a 2024 air pollution median composite.
var pollution1=pollutionCollection1.filterDate('2024-05-14', '2024-06-12')
   .median().clipToCollection(aoi);
var pollution2=pollutionCollection2.filterDate('2024-05-14', '2024-06-12')
   .median().clipToCollection(aoi);
var pollution3=pollutionCollection3.filterDate('2024-05-14', '2024-06-12')
   .median().clipToCollection(aoi);

// Section 3 ////////////////////////////////////////////////////////////////
// Create a function to get the mean air pollution concentration for the study region
// per image in the air pollution collection.
function getConc(collectionLabel, bandName1, img){
   return function(img){
       // Calculate the mean air pollution.
       var imgMean=img.reduceRegion({
           reducer: ee.Reducer.mean(),
           geometry: aoi.geometry(),
           scale: 1000
       })
       .get(bandName1);

       // Get the day-of-year of the image.
       var doy=img.date().getRelative('day', 'year');

       // Return a feature with air pollution concentration and day-of-year properties.
       return ee.Feature(null,{
           'conc': imgMean,
           'DOY': doy,
           'type': collectionLabel
       });
   };
}

function getConc(collectionLabel, bandName2, img){
   return function(img){
       // Calculate the mean air pollution.
       var imgMean=img.reduceRegion({
           reducer: ee.Reducer.mean(),
           geometry: aoi.geometry(),
           scale: 1000
       })
       .get(bandName2);

       // Get the day-of-year of the image.
       var doy=img.date().getRelative('day', 'year');

       // Return a feature with air pollution concentration and day-of-year properties.
       return ee.Feature(null,{
           'conc': imgMean,
           'DOY': doy,
           'type': collectionLabel
       });
   };
}

function getConc(collectionLabel, bandName3, img){
   return function(img){
       // Calculate the mean air pollution.
       var imgMean=img.reduceRegion({
           reducer: ee.Reducer.mean(),
           geometry: aoi.geometry(),
           scale: 1000
       })
       .get(bandName3);

       // Get the day-of-year of the image.
       var doy=img.date().getRelative('day', 'year');

       // Return a feature with air pollution concentration and day-of-year properties.
       return ee.Feature(null,{
           'conc': imgMean,
           'DOY': doy,
           'type': collectionLabel
       });
   };
}

// Get the concentrations for a baseline and lockdown collection
// and merge for plotting.
var aggChange1_forPlotting1=pollutionCollection1
   .filterDate('2024-05-14', '2024-06-12')
   .map(getConc('SO2', bandName1))
aggChange1_forPlotting1=aggChange1_forPlotting1
   .filter(ee.Filter.notNull(['conc']));

var aggChange2_forPlotting2=pollutionCollection2
   .filterDate('2024-05-14', '2024-06-12')
   .map(getConc('NO2', bandName2))
aggChange2_forPlotting2=aggChange2_forPlotting2
   .filter(ee.Filter.notNull(['conc']));
   
var aggChange3_forPlotting3=pollutionCollection3
   .filterDate('2024-05-14', '2024-06-12')
   .map(getConc('CO', bandName3))
aggChange3_forPlotting3=aggChange3_forPlotting3
   .filter(ee.Filter.notNull(['conc']));

// Make a chart.
var chart1=ui.Chart.feature.groups(
       aggChange1_forPlotting1, 'DOY', 'conc', 'type')
   .setChartType('LineChart')
   .setOptions({
       title: 'DOY time series for mean ' + pollutionType1.toUpperCase() + ' from 14-05-2024 to 12-06-2024'
           
   });

// Print it to the console.
print(pollutionType1.toUpperCase() + ' pollution levels in Singapore by DOY', chart1);


var chart2=ui.Chart.feature.groups(
       aggChange2_forPlotting2, 'DOY', 'conc', 'type')
   .setChartType('LineChart')
   .setOptions({
      title: 'DOY time series for mean ' + pollutionType2.toUpperCase() + ' from 14-05-2024 to 12-06-2024'
   });

// Print it to the console.
print(pollutionType2.toUpperCase() + ' pollution levels in Singapore by DOY', chart2);



var chart3=ui.Chart.feature.groups(
       aggChange3_forPlotting3, 'DOY', 'conc', 'type')
   .setChartType('LineChart')
   .setOptions({
       title: 'DOY time series for mean ' + pollutionType3.toUpperCase() + ' from 14-05-2024 to 12-06-2024'
   });

// Print it to the console.
print(pollutionType3.toUpperCase() + ' pollution levels in Singapore by DOY', chart3);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Section 1: Filter median composites for 2023 and 2024
var pollutionMedian1_2024 = pollutionCollection1.filterDate('2024-01-01', '2025-01-01').median();
var pollutionMedian2_2024 = pollutionCollection2.filterDate('2024-01-01', '2025-01-01').median();
var pollutionMedian3_2024 = pollutionCollection3.filterDate('2024-01-01', '2025-01-01').median();


var pollutionMedian1_2023 = pollutionMedian1
var pollutionMedian2_2023 = pollutionMedian2
var pollutionMedian3_2023 = pollutionMedian3

// Section 2: Calculate mean concentrations
var conc1_2023 = pollutionMedian1_2023.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

var conc2_2023 = pollutionMedian2_2023.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

var conc3_2023 = pollutionMedian3_2023.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

var conc1_2024 = pollutionMedian1_2024.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

var conc2_2024 = pollutionMedian2_2024.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

var conc3_2024 = pollutionMedian3_2024.reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: aoi.geometry(),
   scale: 1000
});

// Section 3: Print the concentrations
print('SO2 concentration (2023):',  conc1_2023.get('SO2_column_number_density'));
print('NO2 concentration (2023):', conc2_2023.get('tropospheric_NO2_column_number_density'));
print('CO concentration (2023):', conc3_2023.get('CO_column_number_density'));

print(' ')
// Normalize the concentrations and calculate the air quality rating
function getRating(conc, minVal, maxVal) {
  // Ensure concentrations are within the expected range
  var normConc = ee.Number(conc).clamp(minVal, maxVal);
  // Normalize to a 0-1 scale
  normConc = normConc.subtract(minVal).divide(ee.Number(maxVal).subtract(minVal));
  // Convert to a 0-10 scale
  return normConc.multiply(10);
}

// Define the expected concentration ranges based on Singapore's air quality data
var so2Min = 0.0, so2Max = 0.0001;
var no2Min = 0.0, no2Max = 0.0001;
var coMin = 0.0, coMax = 0.0035;

// Calculate mean concentrations for 2024
var conc1_2024 = pollutionMedian1_2024.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: aoi.geometry(),
  scale: 1000
}).get('SO2_column_number_density');

var conc2_2024 = pollutionMedian2_2024.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: aoi.geometry(),
  scale: 1000
}).get('tropospheric_NO2_column_number_density');

var conc3_2024 = pollutionMedian3_2024.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: aoi.geometry(),
  scale: 1000
}).get('CO_column_number_density');

// Get ratings for each pollutant
var so2Rating = getRating(conc1_2024, so2Min, so2Max);
var no2Rating = getRating(conc2_2024, no2Min, no2Max);
var coRating = getRating(conc3_2024, coMin, coMax);

// Average the ratings to get an overall air quality rating
var overallRating = ee.Number(so2Rating).add(no2Rating).add(coRating).divide(3);

// Print the results
print('SO2 concentration (2024):', conc1_2024);
print('NO2 concentration (2024):', conc2_2024);
print('CO concentration (2024):', conc3_2024);
print(' ');
print('SO2 rating:', so2Rating);
print('NO2 rating:', no2Rating);
print('CO rating:', coRating);
print('Overall air quality rating (out of 10):', overallRating);





