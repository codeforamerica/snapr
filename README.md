[SNAPR](http://codeforamerica.github.com/snapr) is a project built by 2013 @codeforamerica Fellows @anselmbradford, @monfresh, and @spara (the [San Mateo County](http://codeforamerica.org/2013-partners/san-mateo-county/) team). It's basically a map of Food Banks, Human Service Agencies, and Libraries in San Mateo County. You can also get more info about each location by clicking on its pin.

In the spirit of open source and reuse, most of the map rendering is based on Tom Kompare's [Chicago Flu Shots app](https://github.com/tkompare/chicagoflushots).

# Documenting Data Sources

The data in this app are derived from primary data sets and
converted into a comma and quote CSV format, and imported into a [Google Fusion Table](https://www.google.com/fusiontables/data?docid=1ZgxF1WxZtsawkLUmrXEgL1XR1WnSWtLBoNSEsf4#rows:id=1).

The CSV files are available in the [data](https://github.com/codeforamerica/snapr/tree/master/data) directory of our master branch.

### Farmers_Markets.csv
* description: Farmers' markets in the US, includes attribute participating in SNAP
* home page: http://www.ams.usda.gov/AMSv1.0/farmersmarkets
* source: http://www.ams.usda.gov/AMSv1.0/getfile?dDocName=STELPRDC5087258&acct=frmrdirmkt
* notes: converted excel file to csv, removed rows containing title

### San_Mateo_SNAP_stores.csv
* description: SNAP retailer location from the USDA
* home page: http://www.snapretailerlocator.com/
* source: see page
* notes: csv list loaded into QGIS, then clipped using San Mateo county boundary from 2010 Census

### SNAP_registration.csv
* description: combined data from HSA and Second Harvest Food Bank
* home page: http://www.shfb.org/calfreshmap
* home page: http://www.co.sanmateo.ca.us/portal/site/humanservices/menuitem.ef2c94fdbdc30bc965d293e5d17332a0/?vgnextoid=4f3cf85b4e3c3210VgnVCM1000001937230aRCRD&vgnextfmt=DivisionsLanding
* source: Second Harvest Food Bank - http://batchgeo.com/map/kml/6a1e74b1b2fd36b214cc5bda7692fdcc
* notes: HSA data scraped from home page. Second Harvest Food Bank converted from KML to csv. Files merged into common schema.

### smc_libraries.csv
The libraries data was scraped from the [Peninsula Library System](http://plsinfo.org/library-hours/) website and saved to a CSV file using [this Ruby script](https://github.com/codeforamerica/snapr/blob/master/scrapers/smc_libraries_scraper.rb). 



