import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home/Home";
import SearchResults from "./pages/SearchResults/SearchResults";
import Provider from "./pages/Provider/Provider";
import Booking from "./pages/Booking/Booking";
import Bookings from "./pages/Bookings/Bookings";
import BookingStart from "./pages/BookingStart/BookingStart";
import Saved from "./pages/Saved/Saved";
import Profile from "./pages/Profile/Profile";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AccountType from "./pages/AccountType/AccountType";
import BusinessDashboard from "./pages/BusinessDashboard/BusinessDashboard";
import BusinessProfile from "./pages/BusinessProfile/BusinessProfile";
import BusinessServices from "./pages/BusinessServices/BusinessServices";
import BusinessBookings from "./pages/BusinessBookings/BusinessBookings";
import ExplorePage from "./pages/Explore/ExplorePage";
import BusinessCustomers from "./pages/BusinessCustomers/BusinessCustomers";
import BusinessPortfolio from "./pages/BusinessPortfolio/BusinessPortfolio";


function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="USER">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* SEARCH RESULTS */}
        <Route
          path="/search"
          element={
            <ProtectedRoute role="USER">
              <SearchResults />
            </ProtectedRoute>
          }
        />

        {/* EXPLORE */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute role="USER">
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        {/* BOOKINGS */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute role="USER">
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/*BOOKING START*/}
        <Route
          path="/booking"
          element={
            <ProtectedRoute role="USER">
              <BookingStart />
            </ProtectedRoute>
          }
        />

        {/* SAVED */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute role="USER">
              <Saved />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ACCOUNT TYPE */}
        <Route
          path="/account-type"
          element={<AccountType />}
        />

        {/* BUSINESS PORTFOLIO */}
        <Route
          path="/business-portfolio"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessPortfolio />
            </ProtectedRoute>
          }
        />

        {/* BUSINESS DASHBOARD */}
        <Route
          path="/business"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />

        {/* BUSINESS PROFILE */}
        <Route
          path="/business-profile"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessProfile />
            </ProtectedRoute>
          }
        />

        {/* BUSINESS SERVICES */}
        <Route
          path="/business-services"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessServices />
            </ProtectedRoute>
          }
        />

        {/* BUSINESS BOOKINGS */}
        <Route
          path="/business-bookings"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessBookings />
            </ProtectedRoute>
          }
        />

        {/* BUSINESS CUSTOMERS */}
        <Route
          path="/business-customers"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessCustomers />
            </ProtectedRoute>
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROVIDER PROFILE */}
        <Route
          path="/provider/:providerId"
          element={
            <ProtectedRoute role="USER">
              <Provider />
            </ProtectedRoute>
          }
        />

        {/* NEW BOOKING */}
        <Route
          path="/booking/:providerId"
          element={
            <ProtectedRoute role="USER">
              <Booking />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* UNKNOWN URL */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;