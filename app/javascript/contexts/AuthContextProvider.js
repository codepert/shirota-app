import React, { useReducer } from "react";
//import { useHistory } from "react-router-dom";
import { AuthContext } from "./auth.context";
import { AuthReducer, initialAuthState } from "./auth.reducer";
import services from "../services/services";
import { hasError, saveAuthUser } from "../utils/helper";
import authActions from "./auth.actions";
import { createSuccessState, createFailState } from "../utils/manageRequest";
import { loginURL, logoutURL, signupURL } from "../utils/constants";
import { getAuthUserToken, API, makeURLOptionsWtoken } from "../utils/helper";

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialAuthState);

  //const history = useHistory();

  const loginAction = async (payload) => {
    await services
      .login(payload)
      .then((res) => {
        authActions.loginAction(res)(dispatch);
      })
      .catch((err) => {
        authActions.handleLoginErrorAction(err)(dispatch);
        return err;
      });
  };

  const signupAction = async (payload) => {
    try {
      await services.signup(payload);
      return { status: "success" };
    } catch (err) {
      debugger;
      return { status: "error", message: err.code };
    }
  };

  const logoutAction = async () => {
    authActions.logoutAction(dispatch);
    // const res = await services.logout();
    // if (res?.data?.ok) {
    //   authActions.logoutAction(dispatch);
    // }
  };

  const setBeforeRequestAction = (flag) => {
    authActions.setBeforeRequestAction(flag)(dispatch);
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        signupAction,
        loginAction,
        logoutAction,
        setBeforeRequestAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
