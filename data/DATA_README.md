# Documenting Data Sources

The data in this directory are derived from primary data sets and
converted into a comma and quote CSV format.

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
