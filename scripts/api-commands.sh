#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Logo Gallery API Commands ===${NC}\n"

# 1. Get all logos (basic)
echo -e "${GREEN}1. Get all logos (basic):${NC}"
echo "curl -X GET http://localhost:3000/api/logos"
echo

# 2. Get all logos (formatted with jq)
echo -e "${GREEN}2. Get all logos (formatted with jq):${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq '.'"
echo

# 3. Get all logos (formatted and colored)
echo -e "${GREEN}3. Get all logos (formatted and colored):${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq -C '.' | less -R"
echo

# 4. Get only logo names and URLs
echo -e "${GREEN}4. Get only logo names and URLs:${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq '.logos[] | {name, url}'"
echo

# 5. Get logos with high vote counts
echo -e "${GREEN}5. Get logos with most votes:${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq '.logos[] | select(.totalVotes > 10)'"
echo

# 6. Create a new logo (Jardinscampion Logo)
echo -e "${GREEN}6. Create Jardinscampion Logo:${NC}"
echo 'curl -X POST http://localhost:3000/api/logos \
-H "Content-Type: application/json" \
-d '"'{
  \"name\": \"Jardinscampion Logo\",
  \"url\": \"https://jardinscampion.com/wp-content/uploads/2024/03/logo-jardinscampion.png\",
  \"description\": \"Official Jardinscampion logo\",
  \"userId\": \"65f1234567890123456789ab\",
  \"tags\": [\"official\", \"brand\", \"company\"],
  \"totalVotes\": 0
}'"
echo

# 7. Create another logo (Jardinscampion Icon)
echo -e "${GREEN}7. Create Jardinscampion Icon:${NC}"
echo 'curl -X POST http://localhost:3000/api/logos \
-H "Content-Type: application/json" \
-d '"'{
  \"name\": \"Jardinscampion Icon\",
  \"url\": \"https://jardinscampion.com/wp-content/uploads/2024/03/icon-jardinscampion.png\",
  \"description\": \"Jardinscampion icon version\",
  \"userId\": \"65f1234567890123456789ab\",
  \"tags\": [\"icon\", \"brand\", \"minimal\"],
  \"totalVotes\": 0
}'"
echo

# 8. Save output to HTML and open in browser
echo -e "${GREEN}8. Save output to HTML and open in browser:${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq '.' > logos.html && open logos.html"
echo

# 9. Get logos in table format
echo -e "${GREEN}9. Get logos in table format:${NC}"
echo "curl -X GET http://localhost:3000/api/logos | jq -r '.logos[] | [.name, .description, .totalVotes] | @tsv' | column -t -s $'\t'"
echo

# New command to display all images in an HTML gallery
echo -e "${GREEN}10. Generate HTML gallery of all logos:${NC}"
echo 'curl -X GET http://localhost:3000/api/logos | jq -r '"'"'
  "<!DOCTYPE html>
  <html>
  <head>
    <title>Logo Gallery</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      .logo-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
      .logo-card img { width: 100%; height: 300px; object-fit: contain; background: #f5f5f5; }
      .logo-info { margin-top: 10px; }
      .tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
      .tag { background: #e9ecef; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>Logo Gallery from MongoDB</h1>
    <div class="gallery">
    \(.logos[] | "<div class=\"logo-card\">
        <img src=\"\(.url)\" alt=\"\(.name)\">
        <div class=\"logo-info\">
          <h3>\(.name)</h3>
          <p>\(.description)</p>
          <div class=\"tags\">
            \(.tags | map("<span class=\"tag\">\(.)</span>") | join(""))
          </div>
          <p>Total Votes: \(.totalVotes)</p>
        </div>
      </div>")
    </div>
  </body>
  </html>
  '"'" > logo-gallery.html && open logo-gallery.html'
echo

# Add this new command to list all logos in MongoDB
echo -e "${GREEN}11. List all logos in MongoDB:${NC}"
echo 'mongosh "mongodb://localhost:27017/logo-selection" --eval "db.logos.find({}, {name: 1, url: 1, _id: 0}).pretty()"'
echo

# Alternative using mongoose-based API
echo -e "${GREEN}12. List all logos using API (clean format):${NC}"
echo 'curl -X GET http://localhost:3000/api/logos | jq -r ".logos[] | \"\(.name):\n  URL: \(.url)\n  Total Votes: \(.totalVotes)\n\""'
echo

echo -e "${BLUE}=== Usage ===${NC}"
echo "1. Make the script executable: chmod +x api-commands.sh"
echo "2. Run a command: ./api-commands.sh"
echo "3. Or copy/paste individual commands as needed" 