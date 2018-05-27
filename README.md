# SPlus Parser

The [Ostfalia SPlus lecture schedule](http://splus.ostfalia.de) is complicated to use, due to the lacking responsiveness especially on smartphones. However there are some really good and easy to use calendar programs/apps. This project serves as a bridge between SPlus and those programs.

## Setup

Run `npm install` to install the necessary dependencies. Copy `config-example.json`.

Start with `npm start ./config.json` or export `SPLUS_CONFIG=./config.json`. `./config-example.json` is the default configuration path.

#### Google OAuth setup

Follow the [steps provided by Google](https://developers.google.com/calendar/auth#OAuth2Authorizing).
You will receive a `client_secret.json` file which contains your Google API credentials. Save this file as `etc/google/client_secret.json`.

Omit `"icsPath"` in the configuration file.
