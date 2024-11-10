import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Availability from "./pages/availability";
import Roster from "./pages/roster";
function App() {
  return (
    <Router>
      <div className="font-sans text-gray-800 py-4 px-4 sm:px-8 pb-24 mx-auto max-w-3xl w-full">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/roster" element={<Roster />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
