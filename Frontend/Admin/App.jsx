import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashBoard from "./screens/DashBoard"
import AdminLogin from "./screens/AdminLogin"
import AdminSignup from "./screens/AdminSignup"



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />  {/* Default route to Login */}
        <Route path="/signup" element={<AdminSignup />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
