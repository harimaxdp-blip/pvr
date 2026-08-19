
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MovieTicket from "./components/MovieTicket";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ticket/:ticketId" element={<MovieTicket />} />
        <Route path="/" element={<MovieTicket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
