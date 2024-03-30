import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";
import {
  getAuthUserToken,
  getAuthUsername,
  getPermissionPage,
} from "../../utils/helper";
import NavbarSection from "../layouts/Header/Navbar";
import FooterSection from "../layouts/Footer/Index";
import $lang from "../../utils/content/jp.json";
import { useAuth } from "../../hooks/useAuth";

const PrivateRoute = ({ Component }) => {
  const token = getAuthUserToken();
  // const permissionPages =
  //   getPermissionPage() != "" ? JSON.parse(getPermissionPage()) : [];
  // const name = getAuthUsername();
  const [currentPage, setCurrentPage] = useState({});
  const [accessPages, setAccessPages] = useState([]);

  const location = useLocation();
  const user = useAuth();
  const getCurrentPage = () => {
    const navigations = JSON.parse(user.state.permissionPages);
    const accessPages = navigations.filter((item) => {
      if (navigations.filter((i) => i.parent_id == item.page_id).length == 0) {
        return item;
      }
    });
    if (accessPages.length > 0) {
      const currentPageInfo = accessPages.find((item) => {
        return item.path === location.pathname;
      });
      setCurrentPage(currentPageInfo);
    }
  };

  useEffect(() => {
    if (token != null) {
      getCurrentPage();
    } else {
      // redirect
    }
  }, [location, token]);

  useEffect(() => {
    console.log("current_page", currentPage);
  }, [currentPage]);

  return token ? (
    <>
      <NavbarSection />
      {currentPage.is_read == 1 ? (
        <Component is_edit={currentPage.is_edit} />
      ) : (
        <p className="items-center" style={{ fontSize: 50, margin: 300 }}>
          {$lang.pages.warning}
        </p>
      )}
      <FooterSection />
    </>
  ) : (
    <Navigate to="/signin" />
  );
};

export default PrivateRoute;
