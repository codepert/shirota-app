import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../pages/LoginPage";
// import SignupPage from "../../pages/SignupPage";
import NotFonud from "../../pages/404";

import TopPage from "../../pages/TopPage";
import WarehousePage from "../../pages/WarehousePage";
import WarehouseFeePage from "../../pages/WarehouseFeePage";
import ShipperPage from "../../pages/ShipperPage";
import ProductPage from "../../pages/ProductPage";
import UserPage from "../../pages/UserPage";
import PermissionPage from "../../pages/PermissionPage";

import InStockPage from "../../pages/InStockPage";
import OutStockPage from "../../pages/OutStockPage";
import InventoryPage from "../../pages/InventoryPage";
import ReceivedPaymentPage from "../../pages/ReceivedPaymentPage";
import BillingProcessPage from "../../pages/BillingProcessPage";
import BillingListPage from "../../pages/BillingListPage";

import AuthContextProvider from "../../contexts/AuthContextProvider";

import PrivateRoute from "./PrivateRoute";

import { useAuth } from "../../hooks/useAuth";
// import ChangePassword from "../../pages/changePasswordPage";

export const AppRouter = () => {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<LoginPage />} />
          {/* <Route path="/signup" element={<SignupPage />} /> */}
          <Route path="/home" element={<PrivateRoute Component={TopPage} />} />
          <Route
            path="/warehouse"
            element={<PrivateRoute Component={WarehousePage} />}
          />

          <Route
            path="/warehouse_fee"
            element={<PrivateRoute Component={WarehouseFeePage} />}
          />
          <Route
            path="/shipper"
            element={<PrivateRoute Component={ShipperPage} />}
          />

          <Route
            path="/product"
            element={<PrivateRoute Component={ProductPage} />}
          />
          <Route
            path="/user_managent"
            element={<PrivateRoute Component={UserPage} />}
          />
          <Route
            path="/stock_in"
            element={<PrivateRoute Component={InStockPage} />}
          />

          <Route
            path="/stock_out"
            element={<PrivateRoute Component={OutStockPage} />}
          />
          <Route
            path="/stock"
            element={<PrivateRoute Component={InventoryPage} />}
          />
          <Route
            path="/auth_permission"
            element={<PrivateRoute Component={PermissionPage} />}
          />
          <Route
            path="/receive_payment"
            element={<PrivateRoute Component={ReceivedPaymentPage} />}
          />
          <Route
            path="/bill_list"
            element={<PrivateRoute Component={BillingListPage} />}
          />
          <Route
            path="/bill_process"
            element={<PrivateRoute Component={BillingProcessPage} />}
          />
          <Route path="/*" element={<PrivateRoute Component={NotFonud} />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
        {/* <FooterSection /> */}
      </BrowserRouter>
    </AuthContextProvider>
  );
};
