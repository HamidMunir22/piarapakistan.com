import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import Login from "./pages/Login.jsx";
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

const Placeholder = ({ title }) => (
  <div className="container" style={{ padding: "70px 20px", textAlign: "center" }}>
    <h2>{title}</h2>
    <p style={{ color: "var(--pp-muted)" }}>Ye page agle phase mein banega.</p>
  </div>
);

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="/about" element={<Placeholder title="About Us" />} />
        <Route path="/contact" element={<HelpCenter />} />
      </Routes>
    </>
  );
}

export default App;
