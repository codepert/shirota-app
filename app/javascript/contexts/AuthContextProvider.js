import React, { useReducer } from "react";
import { AuthContext } from "./auth.context";
import { AuthReducer, initialAuthState } from "./auth.reducer";
import services from "../services/services";
import authActions from "./auth.actions";

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialAuthState);

  const loginAction = async (payload) => {
    try {
      const res = await services.login(payload);
      authActions.loginAction(res)(dispatch);
      return { state: "success" };
    } catch (err) {
      return { state: "error", code: err.code, status: err?.response?.status };
    }
  };

  const signupAction = async (payload) => {
    try {
      await services.signup(payload);
      return { status: "success" };
    } catch (err) {
      return { status: "error", message: err.code };
    }
  };

  const logoutAction = async () => {
    try {
      const res = await services.logout();
      authActions.logoutAction(dispatch);
      return res;
    } catch (err) {
      return { status: "error", message: err.code };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        signupAction,
        loginAction,
        logoutAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
