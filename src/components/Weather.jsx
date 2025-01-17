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

      setSearchHistory((prevHistory) => [
        {
          name: data.name,
          temperature: data.main.temp,
          description: translatedDescription,
          humidity: data.main.humidity,
          iconUrl,
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">App Meteo</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={city}
          onChange={handleSearch}
          className="form-control"
          placeholder="Inserisci una città"
        />
        <button type="submit" className="btn btn-primary mt-2">
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
          style={{ position: "fixed", top: "0", width: "100%", zIndex: "10" }}
        >
          <div className="card-body">
            <h2 className="card-title">
              Meteo attuale a {currentWeatherData.name}
            </h2>{" "}
            <img
              src={currentWeatherData.iconUrl}
              alt={currentWeatherData.description}
              style={{ width: "50px", height: "50px" }}
            />{" "}
            <p className="card-text">
              Temperatura: {currentWeatherData.temperature}°C
            </p>
            <p className="card-text">
              Descrizione: {currentWeatherData.description}
            </p>
            <p className="card-text">Umidità: {currentWeatherData.humidity}%</p>
          </div>
        </div>
      )}

      <h3 className="mt-5">Cronologia delle ricerche:</h3>
      <div className="d-flex flex-wrap mt-4">
        {searchHistory.map((entry, index) => (
          <div
            key={index}
            className={`card m-2 ${
              entry.name === currentSearch ? "border-primary" : "opacity-50"
            }`}
            style={{ width: "18rem", transition: "all 0.3s ease" }}
          >
            <div className="card-body">
              <h5 className="card-title">{entry.name}</h5>
              <img
                src={entry.iconUrl}
                alt={entry.description}
                style={{ width: "40px", height: "40px" }}
              />{" "}
              <p className="card-text">Temperatura: {entry.temperature}°C</p>
              <p className="card-text">Descrizione: {entry.description}</p>
              <p className="card-text">Umidità: {entry.humidity}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;
