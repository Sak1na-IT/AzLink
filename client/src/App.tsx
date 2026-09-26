import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

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
          element={<Home />}
        />

        {/* SEARCH RESULTS */}
        <Route
          path="/search"
          element={<SearchResults />}
        />

        {/* EXPLORE */}
        <Route
          path="/explore"
          element={<ExplorePage />}
        />

        {/* BOOKINGS */}
        <Route
          path="/bookings"
          element={<Bookings />}
        />
        
        {/*BOOKING START*/}
        <Route path="/booking" element={<BookingStart />} />

        {/* SAVED */}
        <Route
          path="/saved"
          element={<Saved />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ACCOUNT TYPE */}
        <Route
          path="/account-type"
          element={<AccountType />}
        />

        {/* BUSINESS PORTFOLIO */}
        <Route
          path="/business-portfolio"
          element={<BusinessPortfolio />}
        />

        {/* BUSINESS DASHBOARD */}
        <Route
          path="/business"
          element={<BusinessDashboard />}
        />

        {/* BUSINESS PROFILE */}
        <Route
          path="/business-profile"
          element={<BusinessProfile />}
        />

        {/* BUSINESS SERVICES */}
        <Route
          path="/business-services"
          element={<BusinessServices />}
        />

        {/* BUSINESS BOOKINGS */}
        <Route
          path="/business-bookings"
          element={<BusinessBookings />}
        />

        {/* BUSINESS CUSTOMERS */}
        <Route
          path="/business-customers"
          element={<BusinessCustomers />}
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
          element={<Provider />}
        />

        {/* NEW BOOKING */}
        <Route
          path="/booking/:providerId"
          element={<Booking />}
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