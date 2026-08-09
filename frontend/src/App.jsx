import "./App.css";

import GoogleTranslate from "./components/GoogleTranslate";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Scan from "./pages/Scan";
import Result from "./pages/Result";
import Rewards from "./pages/Rewards";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import MunicipalDashboard from "./pages/MunicipalDashboard";
import BottomNav from "./components/BottomNav";


function App() {
  return (
    <BrowserRouter>
      <GoogleTranslate />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/result" element={<Result />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/history" element={<History />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/municipal" element={<MunicipalDashboard />}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;