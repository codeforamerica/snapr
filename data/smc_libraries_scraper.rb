require 'open-uri'
require 'nokogiri'
require 'CSV'

page = open "http://www.smcl.org/node/36"

html = Nokogiri::HTML page

# get all links in table cells with class = "location"
all_links = html.css('td.location a')

# retrieve only the second link in each table cell
# the second link corresponds to the library's url
library_urls = all_links.select.with_index{|_,i| (i+1) % 2 == 0 && (i+1)%4 != 0}

# get each link's text (i.e the library name) and store in array
library_names = []
library_urls.each { |link| library_names.push(link.text) }

# get the rest of the libraries' info: address and phone number
result = html.xpath('//td/text()[preceding-sibling::br]')

# the xpath method above returns 4 lines for each library:
# 2 lines for the address, 1 line for the phone, 1 blank line
# We want to get rid of the 4th blank line
libraries_address_phone = result.select.with_index { |_,i| (i+1) % 4 != 0}

# Since each library now contains 3 lines of info,
# the total number of libraries is the array's size divided by 3
number_of_libraries = (libraries_address_phone.size)/3

# In order to populate a CSV with this data, we need to do a few things:
# 1) create an array of headers for each column
headers = ["name", "address", "phone"]

# 2) extract each library's address and phone into a separate array
# We can do that by iterating through libraries_address_phone 
# and popping every 3 elements into a new array
array_of_library_info_arrays = []

1.upto(number_of_libraries) do
 	a = libraries_address_phone.pop(3)
 	array_of_library_info_arrays.push(a)
end

# 3) join the first 2 address lines of each library into one array element
array_of_library_info_arrays.each do |library| 
	joined_addresses = library[0..1].join(", ") #this returns a string
	library.slice!(0..1) # remove the 2 address elements from the array
	library.insert(0, joined_addresses) # put the joined address back into the array as one element
end

# 4) insert the library name into each library's array
library_names.each_with_index do |name, i|
	array_of_library_info_arrays[i].insert(0, name)
end

CSV.open("smc-libraries.csv", "wb") do |csv|
	csv << headers
	array_of_library_info_arrays.each { |row| csv << row }
end
