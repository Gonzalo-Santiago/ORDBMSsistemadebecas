import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./header.css";

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="logo-icon"></div>
                <div className="logo-text">
                    <span className="title">Registro de Becas</span>
                    <span className="subtitle">Sistema ORDBMS</span>
                </div>
            </div>
            <nav className="navbar-menu">
                <Link to="/registro-becas" className={`navbar-item ${isActive("/registro-becas")}`}>
                    <button>Registro de Becas</button>
                </Link>
                <Link to="/alumnos" className={`navbar-item ${isActive("/alumnos")}`}>
                    <button>Alumnos</button>
                </Link>
                <Link to="/responsables" className={`navbar-item ${isActive("/responsables")}`}>
                    <button>Responsables</button>
                    <Link to="/Programas" className={`navbar-item ${isActive("/programas")}`}>
                        <button>Programas</button>
                    </Link>
                </Link>
            </nav>
        </header>
    );
};

export default Header;