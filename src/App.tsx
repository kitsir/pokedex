// src/App.tsx
import { NavLink, Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import MyPokemon from "./pages/MyPokemon";
import About from "./pages/About";
import Battle from "./pages/Battle";
import "./index.css";

const pill = (isActive: boolean) => `pill ${isActive ? "filled" : "outline"}`;

export default function App() {
  return (
    <div className="app">
      <header className="nav">
        <nav className="nav-inner">
          {/* โลโก้ซ้าย */}
          <div className="nav-left">
            <Link to="/" className="brand-pill">Pokédex</Link>
          </div>

          {/* เมนูขวา (About ขวาสุด) */}
          <div className="nav-right">
            <NavLink to="/" className={({isActive}) => pill(isActive)} end>
              Home
            </NavLink>
            <NavLink to="/my" className={({isActive}) => pill(isActive)}>
              My Pokémon
            </NavLink>
            <NavLink to="/battle" className={({isActive}) => pill(isActive)}>
              Battle
            </NavLink>
            <NavLink to="/about" className={({isActive}) => pill(isActive)}>
              About
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/my" element={<MyPokemon />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<div style={{padding:24}}>Not Found</div>} />
        </Routes>
      </main>

      <footer className="footer"></footer>
    </div>
  );
}
