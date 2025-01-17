import "bootstrap/dist/css/bootstrap.min.css";
import Weather from "./components/Weather";

function App() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="w-100 text-center">
        {" "}
        <Weather />
      </div>
    </div>
  );
}

export default App;
