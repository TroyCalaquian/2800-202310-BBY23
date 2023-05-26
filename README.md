# SoundScope

Our Team, BBY-23, is developing SoundScope to help people who are bored with their current playlists discover new music using our AI powered tool that generates recommendations based on user preferences.

# Technologies used
Frontend: Bootstrap, HTML, CSS, Github
Backend: EJS, JavaScript, Python, Spotify API*, Joi Validation
Database: MongoDB
AI: Sklearn

*The spotify API has some Limitations so the Home page may sometimes Say "Spotify Error"*
# Contents
C:.
|   .gitignore
|   AI.js
|   AIPython.py
|   check.js
|   comma.js
|   databaseConnection.js
|   dupedelter.js
|   index.js
|   inputtest.csv
|   package-lock.json
|   package.json
|   Procfile
|   README.md
|   song_details.csv
|   song_id.csv
|   utils.js
|
+---.vscode
|       settings.json
|
+---public
|   +---pictures
|   |       DefaultPFP.jpg
|   |       welcome.jpeg
|   |       welcome2.webp
|   |
|   +---scripts
|   |       displayErrorURL.js
|   |       headerButtonOnClickHandler.js
|   |       spotifyAPI.js
|   |       spotifyUser.js
|   |       successJS.js
|   |       userInput.js
|   |
|   ---styling
|           loginPage.css
|           profilePageStylesheet.css
|           securityQuestionPage.css
|           signupPage.css
|           successCSS.css
|           universalStyle.css
|           userInput.css
|           welcomePage.css
|
---views
    |   404.ejs
    |   aiData.ejs
    |   callback.ejs
    |   error.ejs
    |   index.ejs
    |   login.ejs
    |   loginfail.ejs
    |   profile.ejs
    |   resetPassword.ejs
    |   results.ejs
    |   securityQuestion.ejs
    |   signup.ejs
    |   signupfail.ejs
    |   spotify.ejs
    |   success.ejs
    |   template.ejs
    |   userInput.ejs
    |   welcome.ejs
    |
    ---templates
            footer.ejs
            header.ejs
            htmlClose.ejs
            htmlOpen.ejs
            songCard.ejs
            userInputSongCard.ejs
# How to run the project
Order Of Install:
We suggest you install VSCode and python before anything else.
Then you can get your loval repo and set up the .env file like explained below.
You should also follow the Node Files like stated bellow.

Code Editor:
We used VSCode as our code editor and we think you should use it or something similar too.

.env:
In the root directory of our project, create a new file called ".env".
In this file you want to copy and paste the following lines(making sure there are no spaces before or after "=" and replacing anything with quotes "example", with the actual information):
MONGODB_HOST="MongoDB Host"
MONGODB_USER="Database User"
MONGODB_PASSWORD="Database Users Password"
MONGODB_DATABASE="Database Name"
MONGODB_SESSION_SECRET="Given MongoDB Session Secret"
NODE_SESSION_SECRET="Given Node Session Secret"
SPOTIFY_CLIENT_ID="Given Spotify client ID"
SPOTIFY_CLIENT_SECRET="Given Spotify Client Secret"

VERY IMPORTANT:
!!!!!!after adding these to the .env, MAKE SURE TO ADD .env TO THE TOP OF THE .gitignore if it is not there!!!!!!!
This is very important as this information should not be publicly available.
The .gitignore should have the following:
.env
/node_modules
package-lock.json

Node Files:
In command line, navigate into the project folder. Run "npm i", to install all needed node packages.

Needed Languages:
You will need to Install Python.

# Features
- Home screen randomly displays a couple of songs from the Spotify API
- You can change your password, username, and profile picture in the profile page
- Create a playlist by inputting a couple of songs

# Credits
Team Members And Their GitHub Profiles:

Troy Calaquian: https://github.com/TroyCalaquian
Brandon Rada: https://github.com/BrandonRada
Caleb Chiang: https://github.com/calebchiang
Maxwell Vanderhoeven: https://github.com/MaxwellVanderhoeven
Kapish Singla: https://github.com/kapish-exe

# AI implementation
The ai was used throughout the project, helping us create, debug, and improve code, along with Sklearn being used in the product itself. The AI currently uses a dataset that helps it recommend songs to the user. There is a couple of limitations to the AI. We did plan on using tags to feed to the user, but the input has to be precise, which the Spotify API does. Because of this, tags had to be scrapped.

# Contact information
Troy Calaquian:
Phone: 778-870-7980
Email: trcalaquian@gmail.com
Discord: LaggySoul#6506

Brandon Rada:
Phone: 778-302-3689
Email: brandonn.rada@gmail.com
Discord: gorgenschnauf27#0233

Caleb Chiang:

Maxwell Vanderhoeven:

Kapish Singla:
