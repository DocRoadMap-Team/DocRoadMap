import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Home from "./Home";

import Login from "./(site)/Connexion/login/login";
import Signup from "./(site)/Connexion/signup/signup";
import SignupConfirm from "./(site)/Connexion/signupconfirm/signupConfirm";

import LanguageSelector from "./(site)/DocRoadMap//docroadmapHome/LanguageSelector";
import DocroadmapHome from "./(site)/DocRoadMap/docroadmapHome/docroadmapHome";
import Profile from "./(site)/DocRoadMap/profile/profile";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signupconfirm" element={<SignupConfirm />} />
          <Route path="/docroadmap" element={<DocroadmapHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/language" element={<LanguageSelector />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
