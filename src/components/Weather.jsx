import { useState, useEffect } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [searchedWeatherData, setSearchedWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [showCurrentWeather, setShowCurrentWeather] = useState(true);

  const apiKey = "f2766217a1ae64c550b2aa0c248f7cee";

  const weatherDescriptionMap = {
    "clear sky": "Cielo sereno",
    "few clouds": "Poche nuvole",
    "scattered clouds": "Nuvole sparse",
    "broken clouds": "Nuvole rotte",
    "shower rain": "Pioggia leggera",
    rain: "Pioggia",
    thunderstorm: "Temporale",
    snow: "Neve",
    mist: "Nebbia",
  };

  const fetchCityImage = async (cityName) => {
    const pexelsApiKey =
      "817K1EidcxG2v1sZ67LKXDvynIsFoB2jV0Vr0wzIEt04qtpuMs9oSPAd";
    const apiUrl = `https://api.pexels.com/v1/search?query=${cityName}&per_page=1`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: pexelsApiKey,
        },
      });
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large;
      }
    } catch (err) {
      console.error("Error fetching image from Pexels:", err);
    }
    return null;
  };

  const fetchWeatherByCity = async (cityName) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=it`
      );
      const data = await response.json();

      if (!response.ok || !data.main) {
        throw new Error("Non siamo riusciti a trovare i dati meteo!");
      }

      const translatedDescription =
        weatherDescriptionMap[data.weather[0].description] ||
        data.weather[0].description;

      const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      const backgroundImage = await fetchCityImage(cityName);

      setSearchHistory((prevHistory) => [
        {
          name: data.name,
          temperature: data.main.temp,
          description: translatedDescription,
          humidity: data.main.humidity,
          iconUrl,
          backgroundImage,
        },
        ...prevHistory,
      ]);

      setCurrentSearch(data.name);
      setSearchedWeatherData({
        name: data.name,
        temperature: data.main.temp,
        description: translatedDescription,
        humidity: data.main.humidity,
        iconUrl,
        backgroundImage,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const fetchWeatherByCoords = async (latitude, longitude) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=it`
      );
      const data = await response.json();

      if (!response.ok || !data.main) {
        throw new Error("Non siamo riusciti a trovare i dati meteo!");
      }

      const translatedDescription =
        weatherDescriptionMap[data.weather[0].description] ||
        data.weather[0].description;

      const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      setCurrentWeatherData({
        name: data.name,
        temperature: data.main.temp,
        description: translatedDescription,
        humidity: data.main.humidity,
        iconUrl,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      setCurrentWeatherData(null);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError("Non siamo riusciti a ottenere la tua posizione.");
          console.error(error);
        }
      );
    } else {
      setError("Geolocalizzazione non supportata.");
    }
  };

  useEffect(() => {
    if (!coords) {
      getLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const handleSearch = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (city) {
      setShowCurrentWeather(false);
      fetchWeatherByCity(city);
      setCity("");
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        textAlign: "center",
        padding: "0 15px",
        position: "relative",
      }}
    >
      <h1
        className="fixed-top d-flex align-items-start mb-6"
        style={{
          fontWeight: "bold",
          fontSize: "48px",
          width: "100%",
          padding: "15px 0",
          zIndex: "10",
          marginLeft: "10px",
        }}
      >
        Il Meteo
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mb-4 mt-5 w-100"
        style={{
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <input
          type="text"
          value={city}
          onChange={handleSearch}
          className="form-control"
          placeholder="Inserisci una città"
        />
        <button type="submit" className="btn btn-primary mt-2 w-100">
          Cerca
        </button>
      </form>
      {loading && (
        <div className="alert alert-info">Caricamento in corso...</div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {showCurrentWeather && currentWeatherData && (
        <div
          className="card mt-4"
          style={{
            width: "100%",
            maxWidth: "800px",
            padding: "2rem",
            background: currentWeatherData.backgroundImage
              ? `linear-gradient(rgba(0, 0, 0, 0), rgba(119, 125, 185, 0.55)), url(${currentWeatherData.backgroundImage})`
              : "white",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: currentWeatherData.backgroundImage ? "white" : "black",
            textShadow: currentWeatherData.backgroundImage
              ? "0 1px 3px rgba(0, 0, 0, 0.8)"
              : "none",
          }}
        >
          <div className="d-flex justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <img
                src={currentWeatherData.iconUrl}
                alt={currentWeatherData.description}
                style={{ width: "70px", height: "70px", marginRight: "15px" }}
              />
              <h4
                className="card-title mt-2"
                style={{ textTransform: "uppercase", fontSize: "2rem" }}
              >
                {currentWeatherData.name}
              </h4>
            </div>
            <div>
              <p className="card-text" style={{ fontSize: "1.5rem" }}>
                Temperatura:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {currentWeatherData.temperature}°C
                </span>
              </p>
              <p className="card-text" style={{ fontSize: "1.4rem" }}>
                Condizioni Meteo:{" "}
                <span
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                  {currentWeatherData.description}
                </span>
              </p>
              <p className="card-text" style={{ fontSize: "1.4rem" }}>
                Umidità:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {currentWeatherData.humidity}%
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {showCurrentWeather === false && currentWeatherData && (
        <div
          className="card position-fixed"
          style={{
            top: "20px",
            right: "20px",
            width: "250px",
            padding: "1.2rem",
            background: currentWeatherData.backgroundImage
              ? `linear-gradient(rgba(0, 0, 0, 0), rgba(119, 125, 185, 0.55)), url(${currentWeatherData.backgroundImage})`
              : "white",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: currentWeatherData.backgroundImage ? "white" : "black",
            textShadow: currentWeatherData.backgroundImage
              ? "0 1px 3px rgba(0, 0, 0, 0.8)"
              : "none",
            zIndex: "9999",
          }}
        >
          <div className="d-flex flex-column align-items-center">
            <img
              src={currentWeatherData.iconUrl}
              alt={currentWeatherData.description}
              style={{ width: "40px", height: "40px", marginBottom: "10px" }}
            />
            <h6 style={{ fontSize: "1rem" }}>{currentWeatherData.name}</h6>
            <p style={{ fontSize: "1rem" }}>
              {currentWeatherData.temperature}°C
            </p>
          </div>
        </div>
      )}

      {searchedWeatherData && (
        <div
          className="card mt-4"
          style={{
            width: "100%",
            maxWidth: "800px",
            padding: "2rem",
            background: searchedWeatherData.backgroundImage
              ? `linear-gradient(rgba(0, 0, 0, 0), rgba(119, 125, 185, 0.55)), url(${searchedWeatherData.backgroundImage})`
              : "white",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: searchedWeatherData.backgroundImage ? "white" : "black",
            textShadow: searchedWeatherData.backgroundImage
              ? "0 1px 3px rgba(0, 0, 0, 0.8)"
              : "none",
          }}
        >
          <div className="d-flex justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <img
                src={searchedWeatherData.iconUrl}
                alt={searchedWeatherData.description}
                style={{ width: "70px", height: "70px", marginRight: "15px" }}
              />
              <h4
                className="card-title mt-2"
                style={{ textTransform: "uppercase", fontSize: "2rem" }}
              >
                {searchedWeatherData.name}
              </h4>
            </div>
            <div>
              <p className="card-text" style={{ fontSize: "1.5rem" }}>
                Temperatura:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {searchedWeatherData.temperature}°C
                </span>
              </p>
              <p className="card-text" style={{ fontSize: "1.4rem" }}>
                Condizioni Meteo:{" "}
                <span
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                  {searchedWeatherData.description}
                </span>
              </p>
              <p className="card-text" style={{ fontSize: "1.4rem" }}>
                Umidità:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {searchedWeatherData.humidity}%
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {searchHistory.length > 0 && (
        <>
          <h3 className="mt-5">Cronologia delle ricerche:</h3>
          <div
            className="d-flex flex-nowrap mt-4"
            style={{
              overflowX: "auto",
              padding: "10px",
              backgroundColor: "#f7f7f7",
              borderRadius: "5px",
              maxWidth: "100%",
            }}
          >
            {searchHistory.map((entry, index) => (
              <div
                key={index}
                className={`card m-2 ${
                  entry.name === currentSearch ? "border-primary" : "opacity-50"
                }`}
                style={{
                  width: "250px",
                  minWidth: "200px",
                  padding: "1.5rem",
                  background: entry.backgroundImage
                    ? `linear-gradient(rgba(0, 0, 0, 0), rgba(119, 125, 185, 0.55)), url(${entry.backgroundImage})`
                    : "white",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: entry.backgroundImage ? "white" : "black",
                  textShadow: entry.backgroundImage
                    ? "0 1px 3px rgba(0, 0, 0, 0.8)"
                    : "none",
                }}
              >
                <div className="card-body">
                  <div className="d-flex flex-column align-items-start">
                    <img
                      src={entry.iconUrl}
                      alt={entry.description}
                      style={{
                        width: "50px",
                        height: "50px",
                        marginBottom: "10px",
                      }}
                    />
                    <h6>{entry.name}</h6>
                    <p>
                      {entry.temperature}°C - {entry.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
