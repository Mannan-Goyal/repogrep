import { Routes, Route } from "react-router-dom";
import LoginButton from "./components/LoginButton";
import Home from "./components/Home";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginButton />} />
      </Routes>
    </>
  );
}

export default App;
