import { Route, Routes } from "react-router-dom";
import "./App.css";
// import { supabase } from "@/utils/supabase";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import GL from "./pages/GL";
import GP from "./pages/GP";
import OC from "./pages/OC";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/GL" element={<GL />} />
        <Route path="/GP" element={<GP />} />
        <Route path="/OC" element={<OC />} />
      </Route>
    </Routes>
  );
}

export default App;
