require 'open-uri'
require 'nokogiri'
require 'geocoder'
require 'csv'

def get_lat_long(address)
	result = Geocoder.coordinates(address)
	@latitude = result[0]
	@longitude = result[1]
end
 
ENDPOINT = "http://www.smcl.org/node/36"
 
html = Nokogiri::HTML open(ENDPOINT)
 
# get all links in table cells with class = "location"
libraries = html.css("tbody tr")
 
# retrieve only the second link in each table cell
# the second link corresponds to the library's url
rows = []

libraries.each do |library|
  result           = library.text.split("\r\n").reject {|chunk| chunk.strip.empty? }.map(&:strip)

  name             = result[0]
  address          = result[1]
  city, state, zip = result[2].scan(/\w+/)
  phone            = result[3].scan(/\d+/).join(".")

  get_lat_long(address)
  sleep(0.5)

  row = {
    name:    name,
    address: "#{address}, #{city}, #{state} #{zip}",
    phone:   phone,
    longitude: @longitude,
    latitude: @latitude
  }

  rows << row
end

headers = rows.first.keys

CSV.open("smc-libraries.csv", "wb") do |csv|
  csv << headers
  rows.map(&:values).each do |row|
    csv << row
  end
end