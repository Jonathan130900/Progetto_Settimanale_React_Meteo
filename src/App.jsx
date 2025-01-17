import "bootstrap/dist/css/bootstrap.min.css";
import Weather from "./components/Weather";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div>
        <Weather />
      </div>
    </div>
  );
}

export default App;
