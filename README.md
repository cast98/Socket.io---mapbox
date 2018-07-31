# Map Driver ETA Recipe

This application is powered by [Express](https://expressjs.com/), [Mapbox](https://www.mapbox.com/). 

## Registration

You will eed to [sign up](https://www.mapbox.com/signup/) for a Mapbox developer account and generate an API key.

## Installation

Install dependencies using npm:
```console
npm i
```

Set the Mapbox API key in `/public/javascripts/MapComponent.js`:
```console
mapboxgl.accessToken = "YOUR_MAPBOX_API_KEY";
```

Run the app:
```console      
npm run debug
```

Go to [http://localhost:3000](http://localhost:3000) in your browser to start using the app.
