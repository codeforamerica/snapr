require 'open-uri'
require 'nokogiri'
require 'geocoder'
require 'csv'

def get_lat_long(address)
  result = Geocoder.coordinates(address)
  @latitude = result[0]
  @longitude = result[1]
end
 
ENDPOINT = "http://plsinfo.org/library-hours/byletter".freeze
ALPHABET = ("a".."z").to_a.freeze

rows = []
days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

ALPHABET.each do |letter|
  html      = Nokogiri::HTML open("#{ENDPOINT.dup}/#{letter}")
  libraries = html.css(".views-row")
 
  libraries.each do |library|
    name    = library.at_css(".views-field-title .field-content").text
    street  = library.at_css(".street-address").text
    city    = library.at_css(".locality").text
    state   = library.at_css(".region").text
    zip     = library.at_css(".postal-code").text
    phone = library.css(".country-name")[1].text.split(":")[1]

    address = "#{street}, #{city}, #{state} #{zip}"

    get_lat_long(address)
    sleep(0.5)
    
    row = {
      name:    name,
      address: "#{street}, #{city}, #{state} #{zip}",
      phone:   phone,
      location: "#{@longitude},#{@latitude}"
    }

    i = 6
    days.each do |day|
      cells = library.css("td")
      opens_at = [[cells.at(i), cells.at(i+1)].join(""), cells.at(i+2)].join(" ")
      closes_at = [[cells.at(i+3), cells.at(i+4)].join(""), cells.at(i+5)].join(" ")
      row["#{day} opens at"] = opens_at
      row["#{day} closes at"] = closes_at
      i += 8
    end

    row["Source"] = "Library"

    rows << row

  end
end

headers = rows.first.keys

CSV.open("smc-libraries.csv", "wb") do |csv|
  csv << headers
  rows.map(&:values).each do |row|
    csv << row
  end
end