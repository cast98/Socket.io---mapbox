window.MapComponent = (function (window, document, api) {

    //token for using library
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWR5dWhubyIsImEiOiJjampneHdjNG4wODRyM3FybHN0dTF6aXRrIn0.620vyF08CNZESI4i3nBPuA';

    //variable to store the time of the last selection from the database
    const date = new Date();
    var time = date.today() + ' ' + date.timeNow();

    //arrays for saving event listeners
    var enterListeners = {};
    var leaveListeners = {};

    //popup object
    const popUp = new mapboxgl.Popup({ closeButton: false });

    //creating map in div#map
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        center: [0, 30],
        zoom: 1.45
    });

    //disable zoom on map
    map.scrollZoom.disable();

    //set cursor style for map
    var canvas = map.getCanvasContainer();
    canvas.style.cursor = 'default';

    //variable for describing point (marker)
    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-95.278097, 29.309956]
            }
        }]
    };

    //fucntions for describing cursors behavior while draggin
    function mouseDown() {
        canvas.style.cursor = '';
    }

    function mouseUp() {
        canvas.style.cursor = 'default';
    }

    map.on('mousedown', mouseDown);
    map.on('mouseup', mouseUp);

    //function for describing event when cursor enter on marker
    const mouseEnter = function (user) {
        canvas.style.cursor = 'pointer';
        isCursorOverPoint = true;
        map.dragPan.disable();

        popUp.setLngLat([user.coordLongitude, user.coordLatitude])
            .setHTML(`<table>
            <tr>
                <td rowspan=3><img style="width: 55px; padding-right: 10px;" src="${user.imageUrl}"></td>
                <td><b>${user.name}</b></td>
            </tr>
            <tr>
                <td><b>${user.surname}</b></td>
            </tr>
            <tr>
                <td><em>${user.email}</em></td>
            </tr>
        </table>`)
            .addTo(map);
    }

    //function for describing event when cursor leave out marker
    const mouseLeave = function (user) {
        canvas.style.cursor = 'default';
        isCursorOverPoint = false;
        map.dragPan.enable();

        popUp.remove();
    }

    //method for getting data about users (new users, changed data or deleted data) from DB
    const getDataFromDB = async (data) => {
        const res = await fetch(data.url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ time: time }),
        });
        const json = await res.json();
        return json;
    }

    const addPoint = function (user, next) {
        //set coordinates of current user
        geojson.features[0].geometry.coordinates[0] = user.coordLongitude;
        geojson.features[0].geometry.coordinates[1] = user.coordLatitude;

        //add source for current user
        map.addSource('id=' + user.id, {
            'type': 'geojson',
            'data': geojson
        });

        //add point (marker) for current user on map
        map.addLayer({
            'id': 'id=' + user.id,
            'type': 'symbol',
            'source': 'id=' + user.id,
            'layout': {
                'icon-image': 'marker',
                'icon-size': 0.133989
            }
        });

        //call next function
        next(user);
    }

    const removePoint = function (user) {
        //remone markers
        map.removeSource('id=' + user.id);
        map.removeLayer('id=' + user.id);

        //remove events frmo event listeners
        map.off('mouseenter', 'id=' + user.id, enterListeners[user.id]);
        map.off('mouseleave', 'id=' + user.id, leaveListeners[user.id]);

        //remove eventes from our array of events
        delete enterListeners[user.id];
        delete leaveListeners[user.id];
    }

    const setEvents = function (user) {
        //save event listeners
        enterListeners[user.id] = mouseEnter.bind(this, user);
        leaveListeners[user.id] = mouseLeave.bind(this, user);

        // When the cursor enters a feature in the point layer.
        map.on('mouseenter', 'id=' + user.id, enterListeners[user.id]);
        map.on('mouseleave', 'id=' + user.id, leaveListeners[user.id]);
    }

    map.on('load', function () {
        //load an image for marker
        map.loadImage('../images/2a.png', function (error, image) {
            if (error) {
                throw error;
            }
            else {
                map.addImage('marker', image);
            }
        });

        //connect to server socket
        const socket = io.connect('http://localhost:3000');

        //socket for connection with server
        socket.on('connection_custom', function (data) {
            fetch(data.url, {
                method: 'get',
            }).then(function (res) {
                res.json().then(function (data) {
                    time = data.time;
                    if (data.success === true) {
                        data.users.forEach(e => {
                            addPoint(e, setEvents);
                        })
                    }
                })
            }).catch(function (err) {
                console.log(err);
            });
        });

        //socket for getting new data (that was added to database)
        socket.on('get_new_data', async (data) => {
            let dataFromDB = await getDataFromDB(data);
            time = dataFromDB.time;
            if (dataFromDB.success === true) {
                dataFromDB.users.forEach(e => {
                    addPoint(e, setEvents);
                })
            }
        })

        //socket for getting chages in database
        socket.on('get_updated_data', async (data) => {
            let dataFromDB = await getDataFromDB(data);
            time = dataFromDB.time;
            if (dataFromDB.success === true) {
                dataFromDB.users.forEach(e => {
                    removePoint(e);
                    addPoint(e, setEvents);
                })
            }
        })

        //socket for getting data adput deleted users
        socket.on('get_deleted_data', function (data) {
            removePoint(data);
        })
    });
})(window, window.document, window.ApiComponent);