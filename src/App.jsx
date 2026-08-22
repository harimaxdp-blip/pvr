import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MovieTicket from "./components/MovieTicket";
import UpdateTicket from "./components/UpdateTicket";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* INITIAL PAGE → SPECIFIC TICKET */}
        <Route
          path="/"
          element={
            <Navigate to="/ticket/(iR8PHEN)y54KYkbuvJ6Ag==" replace />
          }
        />

        {/* UPDATE PAGE */}
        <Route
          path="/ticket/"
          element={<UpdateTicket />}
        />

        {/* ACTUAL TICKET */}
        <Route
          path="/ticket/:ticketId"
          element={<MovieTicket />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<MovieTicket />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;