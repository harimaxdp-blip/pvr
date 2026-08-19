import { BrowserRouter, Routes, Route } from "react-router-dom";
import MovieTicket from "./MovieTicket";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ticket/:ticketToken" element={<MovieTicket />} />
      </Routes>
    </BrowserRouter>
  );
}