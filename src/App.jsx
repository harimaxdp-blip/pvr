import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MovieTicket from "./components/MovieTicket";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/ticket/:ticketId"
          element={<MovieTicket />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/ticket/(iR8PHEN)y54KYkbuvJ6Ag=="
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;