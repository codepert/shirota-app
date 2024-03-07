import React, { useEffect, useMemo } from "react";
// import { useTranslation } from "react-i18next";
import SignUpForm from "../features/auth/SignUpForm";
import { falsy, getAuthUser } from "../utils/helper";

const LoginPage = () => {
  const token = useMemo(() => getAuthUser().token, [getAuthUser().token]);

  useEffect(() => {
    if (!falsy(token)) {
      return;
    }
  }, [token]);

  return (
    <>
      <SignUpForm />
    </>
  );
};

export default LoginPage;
