# INFER - Remote Sensing of Irish Surface Waters

The curation of historical Earth Observation Data for Irish surface waters using the Landsat archive. The use of cloud computing resources courtesy of Google Earth Engine (GEE) was used to identify viable archive imagery data mapping Irish surface waters of interest going back almost 4 decades, with the resulting data curated for use by future researchers, in particular EPA and other state agencies who have long term monitoring programmes at specific locations.

## Description

Contained within this repository are four JavaScript applications that will search Landsat archives on Google Earth Engine for images containing Irish lakes of interest (specified in code): 

* shpLandsat4TOACloudBrowseFnl: For Lansdat 4.
* shpLandsat5TOACloudBrowseFnl: For Landsat 5, this is the most useful as Landsat 5 had a long operational life.
* shpLandsat7TOACloudBrowseFnl: For Landsat 7, only useful up to 2003 due to fault on satellite.
* shpLandsat8TOACloudBrowseFnl: For Landsat 8, operational since 2013.

The code takes into account the amount of cloud cover over the lake, for example the code as presented here returns Landsat images (products) were the cloud cover over the lake in question is less than 25%. The cloud cover metric can be edited in the code. 

The algorithm follows these steps:

* Filter a complete Landsat collection of images for images that contain the lake of interest.
* Filter this new collection by setting date range of interest.
* Add a Simple Cloud Cover score (and algorithm implemented and supplies as an API by GEE) to each pixel of image in the filtered collection.
* Calculate the average Simple Cloud Score over the lake of interest and filter the remaining collection using the metric of cloud cover over the lake. The code supplied here creates a collection of Landsat images where the cloud cover over the desired lake is less than 25%. 

### Viewing Results

When the processing is complete a graph will be created of the cloud cover statistics for image and the lake in the image over time. Clicking on a point on the graph with display the corresponding image in the map viewer.

The data in the graph can be saved as a CSV file.

## Results Folder

Two Results folders are supplied. One folder contains results in CSV format and the other in XLS (MS Excel) format. These results are high level summary results which are outputs from the INFER project. They are also a useful overview of what can be done with code supplied. In order to produce these results the data produced by the code was extracted from GEE and put into an SQL Database for further analysis. The content in both are identical. The files supplied are as follows:

1) AllLandsatQuery_25_Crosstab: This is a Cross Tab query that lists the Landsat Product Ids from 1984 to 2021 of Landsat products that contain observations of the lakes listed in the query where the cloud cover over the lake is <25%. It contains the following fields:

* Product_Id of the Landsat product: Name of the Landsat Product.
* Date: Date of the Landsat fly over.
* LandsatID: Name of the satellite.
* Total Number of observations of lakes with <25% Cloud Cover. 

Note that one Landsat Product can contain observations of a number of lakes.

2) OvelapDates_Crosstab: This a Croos Tab query by year and month that lists the number of individual Landsat products that met the criteria of the project. Each Landsat scene contains at least one observation of a lake of interest where the cloud cover over the lake is < 25%

3) Look_Up_Lakes: A look up table of the lakes used for the comparison between EPA InSitu and EO observations.

4) OverlapwithEPASampling_2007_2017: The Landsat products that overlap EPA InSitu measurements. The dates of EPA water quality in-situ measurements at lakes in Ireland from 2007 to 2017 were matched with the dates of Landsat observations of the same lakes with < 25% cloud cover. This file contains the following fields:

* AllLandsat_EdenCode: The EPA's unique ID code for the lake. 
* LakenName: The name of the lake. This may not be unique as a few lakes in Ireland have the same name.
* LandsatID: The name of the satellite.
* Product_Id: The unique identification of the Landsat product. This can be used to retrieve the product one of the numerous archives storing Landsat data.
* CloudCoverOverLake%: The average cloud cover over the lake.
* EO_Date: The date of the observation of the lake from taken by Landsat.
* InSitu_samp_date: The date of the observation taken at the lake taken by the EPA.
* Days_Between_InSitu_and_EO_obv: The difference in days between the EO observation and the in-situ observation. The EO observation is matched with a period of time that consists of 14 days either side of the in-situ observation date.
* Search_StartDate: 14 days before in-situ observation date.
* Search_EndDate: 14 days after in-situ observation date.
* Data_Source: Source of in-situ observations.

### Dependencies

* To run this code you must have an account on Google Earth Engine (GEE)
* When you have the code open in GEE check that reference to the WFD_LakeSegment works, you can do this by simply running the code, and error will be thrown if you don't have access to WFD_LakeSegment. WFD_LakeSegment is a shape file containing polygons of Irish Lakes and rivers. The Irish EPA produces it and the latest one is available here [https://gis.epa.ie/GetData/Download].

### Installing

* Copy the contents of the JavaScript file into and open file in GEE.

### Executing program

* From within GEE click Run

## Authors

Contributors names and contact info

Conor Delaney  
[@snaggyd](https://twitter.com/snaggyd)

## License

This project is licensed under the Creative Commons By 4.0 License - see the LICENSE.md file for details


