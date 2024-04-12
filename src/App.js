import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";
import Admin from "./pages/Admin";
import BookAppointment from "./pages/BookAppointment";

import Home from "./pages/Home";

import Profile from "./pages/Profile";
import Register from "./pages/Register";

import Login from "./pages/Login";
import ClientForm from "./pages/ClientForm";

function App() {
  const { loading } = useSelector((state) => state.loader);
  return (
    <div>
      {loading && <Spinner />}
      <BrowserRouter>
        <Routes>
       
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment/:id"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply-client"
            element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
