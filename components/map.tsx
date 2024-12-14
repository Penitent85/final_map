import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";

import { FaMapMarkerAlt } from "react-icons/fa";
import { userLocations } from "../data/userLocations";

import Distance from "./distance";



type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [ipAddress, setIpAddress] = useState("");
  const [office, setOffice] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(() => ({ lat: 31.45, lng: 34.49 }), []);
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "d64d8002a6199944",
      disableDefaultUI: true,
      clickableIcons: true,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const houses = useMemo(() => generateHouses(center), [center]);
  const [name, setName] = useState("");

  const fetchDirections = (house: LatLngLiteral) => {
    if (!office) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: house,
        destination: office,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        }
      }
    );
  };
  useEffect(() => {
    if (navigator.geolocation) {
      console.log(navigator.geolocation.getCurrentPosition)
      navigator.geolocation.getCurrentPosition((position) => {
        setOffice({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        mapRef.current?.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);
  const setLocation = () => {
    try {
      // console.log(userLocations)
      const location = userLocations.find(
        (user) => user.name === name
      )?.location;
      console.log(location);
      setOffice(location as any);
      mapRef.current?.panTo(location as any);
    } catch {
      alert("User not found");
    }
  };

  return (
    <div className="container">
      <div className="controls">
        <h1>Commute?</h1>
        <input
          type="text"
          style={{
            backgroundColor: "white",
            color: "black",
            padding: "20px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          style={{
            backgroundColor: "white",
            color: "black",
            padding: "20px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
          onClick={setLocation}
        >
          Generate Random Location
        </button>



        <div>
          {userLocations.map((user) => (
            <div
              key={user.name}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                setOffice(user.location);
                mapRef.current?.panTo(user.location);
              }}
            >
              <FaMapMarkerAlt />
              <p>{user.name}</p>
            </div>
          ))}
        </div>


        {!office && <p>Enter the address of your office.</p>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
      <div className="map">
        <GoogleMap
          zoom={14}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {office && (
            <>
              <Marker position={office} />

              <MarkerClusterer>
                {(clusterer) =>
                  houses.map((house) => (
                    <Marker
                      key={house.lat}
                      position={house}
                      clusterer={clusterer}
                      onClick={() => {
                        fetchDirections(house);
                      }}
                    />
                  ))
                }
              </MarkerClusterer>

              <Circle center={office} radius={500} options={closeOptions} />
              {/* <Circle center={office} radius={30000} options={middleOptions} /> */}
              {/* <Circle center={office} radius={45000} options={farOptions} /> */}
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};
