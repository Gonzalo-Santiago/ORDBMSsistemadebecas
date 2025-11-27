// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header";
import RegistroBecas from "./components/inicio";
import Alumnos from "./components/alumnos";
import Responsables from "./components/responsables";
import Programas from "./components/programas";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<RegistroBecas />} />
            <Route path="/registro-becas" element={<RegistroBecas />} />
            <Route path="/alumnos/*" element={<Alumnos />} />  {/* ← Cambiado a /* */}
            <Route path="/responsables" element={<Responsables />} />
            <Route path="/programas" element={<Programas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;