import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { ToastContainer } from "react-toastify";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import "react-toastify/dist/ReactToastify.css";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import UserProfilePage from "./pages/profile/UserProfilePage.jsx";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage.jsx";
import AddressBookPage from "./pages/profile/AddressBookPage.jsx";
import ProfileLayout from "./layouts/ProfileLayout.jsx";
import ShoeTryOn from "./components/ShoeTryOn.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import InventoryPage from "./pages/admin/InventoryPage.jsx";
import OrderManagement from "./pages/admin/OrdersManagement.jsx";
import OrderDetailManagement from "./pages/admin/OrderDetailManagement.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Dashboard</div>} />
          <Route path="products" element={<InventoryPage />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:id" element={<OrderDetailManagement />} />
        </Route>

        <Route path="/product/try-on" element={<ShoeTryOn />} />

        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/:id" element={<PaymentPage />} />
                <Route
                  path="/order-success/:id"
                  element={<OrderSuccessPage />}
                />
                <Route path="/order/:id" element={<OrderDetailPage />} />
                <Route path="/profile" element={<ProfileLayout />}>
                  <Route index element={<UserProfilePage />} />
                  <Route path="password" element={<ChangePasswordPage />} />
                  <Route path="addresses" element={<AddressBookPage />} />
                  <Route path="orders" element={<OrderHistoryPage />} />
                </Route>
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </>
  );
}

export default App;
