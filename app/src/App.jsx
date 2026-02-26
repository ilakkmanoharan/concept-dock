import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import CreateDesign from "./pages/CreateDesign";
import DesignEditor from "./pages/DesignEditor";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/design" element={<CreateDesign />} />
        <Route path="/design/editor" element={<DesignEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
