import { useState, useEffect } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [searchedWeatherData, setSearchedWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentSearch, setCurrentSearch] = useState(null);

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
      "817K1EidcxG2v1sZ67LKXDvynIsFoB2jV0Vr0wzIEt04qtpuMs9oSPAd"; // Replace with your API key
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
      }}
    >
      <h1 className="mb-4">App Meteo</h1>
      <form
        onSubmit={handleSubmit}
        className="mb-4 w-100"
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
      {currentWeatherData && (
        <div
          className="card mt-4"
          style={{
            width: "100%",
            maxWidth: "600px",
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
          <div className="card-body d-flex justify-content-between">
            <div
              className="d-flex flex-row align-items-center justify-content-center"
              style={{ marginRight: "20px", width: "auto" }}
            >
              <img
                src={currentWeatherData.iconUrl}
                alt={currentWeatherData.description}
                style={{
                  width: "70px",
                  height: "70px",
                  marginRight: "15px",
                }}
              />
              <h4
                className="card-title mt-2"
                style={{ textTransform: "uppercase", fontSize: "1.8rem" }}
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
                  width: "28rem",
                  minWidth: "24rem",
                  maxWidth: "28rem",
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
                <div className="card-body d-flex justify-content-between">
                  <div
                    className="d-flex flex-column align-items-start"
                    style={{ marginRight: "20px" }}
                  >
                    <img
                      src={entry.iconUrl}
                      alt={entry.description}
                      style={{ width: "50px", height: "50px" }} // Larger icon
                    />
                    <h2 className="card-title mt-2">{entry.name}</h2>
                  </div>

                  <div>
                    <p className="card-text" style={{ fontSize: "1.2rem" }}>
                      Temperatura:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {entry.temperature}°C
                      </span>
                    </p>
                    <p className="card-text" style={{ fontSize: "1.2rem" }}>
                      Condizioni Meteo:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {entry.description}
                      </span>
                    </p>
                    <p className="card-text" style={{ fontSize: "1.2rem" }}>
                      Umidità:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {entry.humidity}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}{" "}
    </div>
  );
};

export default Weather;
