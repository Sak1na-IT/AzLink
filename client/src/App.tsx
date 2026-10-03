import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import BusinessLayout from "./components/business/BusinessLayout";
import BusinessPlaceholder from "./components/business/BusinessPlaceholder";
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
import ExplorePage from "./pages/Explore/ExplorePage";
import BusinessDashboard from "./pages/BusinessDashboard/BusinessDashboard";
import BusinessProfile from "./pages/BusinessProfile/BusinessProfile";
import BusinessServices from "./pages/BusinessServices/BusinessServices";
import BusinessBookings from "./pages/BusinessBookings/BusinessBookings";
import BusinessCustomers from "./pages/BusinessCustomers/BusinessCustomers";
import BusinessPortfolio from "./pages/BusinessPortfolio/BusinessPortfolio";
import BusinessHours from "./pages/BusinessHours/BusinessHours";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* HOME — yalnız USER (biznes hesabının əsas səhifəsi /business-dir) */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="USER">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* ORTAQ SƏHİFƏLƏR — hər iki rol üçün */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
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
          path="/provider/:providerId"
          element={
            <ProtectedRoute>
              <Provider />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:providerId"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        {/* BİZNESİM — alt-naviqasiya olan ortaq layout */}
        <Route
          path="/business"
          element={
            <ProtectedRoute role="BUSINESS">
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BusinessDashboard />} />
          <Route path="profile" element={<BusinessProfile />} />
          <Route path="services" element={<BusinessServices />} />
          <Route path="bookings" element={<BusinessBookings />} />
          <Route path="portfolio" element={<BusinessPortfolio />} />
          <Route
            path="reviews"
            element={<BusinessPlaceholder title="Rəylər" />}
          />
          <Route path="customers" element={<BusinessCustomers />} />
          <Route path="hours" element={<BusinessHours />} />
        </Route>

        {/* KÖHNƏ BİZNES YOLLARI → yeni yollara */}
        <Route
          path="/business-profile"
          element={<Navigate to="/business/profile" replace />}
        />
        <Route
          path="/business-services"
          element={<Navigate to="/business/services" replace />}
        />
        <Route
          path="/business-bookings"
          element={<Navigate to="/business/bookings" replace />}
        />
        <Route
          path="/business-customers"
          element={<Navigate to="/business/customers" replace />}
        />
        <Route
          path="/business-portfolio"
          element={<Navigate to="/business/portfolio" replace />}
        />

        {/* AUTH */}
        <Route path="/account-type" element={<AccountType />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;