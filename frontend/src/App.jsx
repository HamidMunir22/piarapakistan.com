import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import AdminVerifyOtp from "./pages/AdminVerifyOtp.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Categories from "./pages/Categories.jsx";
import Search from "./pages/Search.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Messages from "./pages/Messages.jsx";
import MockPayment from "./pages/MockPayment.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import MyListings from "./pages/dashboard/MyListings.jsx";
import ListingForm from "./pages/dashboard/ListingForm.jsx";
import SellerOrders from "./pages/dashboard/SellerOrders.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import KycApprovals from "./pages/admin/KycApprovals.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminListings from "./pages/admin/Listings.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import Commission from "./pages/admin/Commission.jsx";
import AdminComplaints from "./pages/admin/Complaints.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/admin-verify-otp" element={<AdminVerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/mock/:intentId"
          element={
            <ProtectedRoute>
              <MockPayment />
            </ProtectedRoute>
          }
        />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route
          path="/dashboard/listings"
          element={
            <ProtectedRoute allowedRoles={["seller", "shop"]}>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/listings/new"
          element={
            <ProtectedRoute allowedRoles={["seller", "shop"]}>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/listings/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["seller", "shop"]}>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute allowedRoles={["seller", "shop"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="kyc" element={<KycApprovals />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="commission" element={<Commission />} />
          <Route path="complaints" element={<AdminComplaints />} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <Footer />
      <Chatbot />
    </>
  );
}

export default App;
