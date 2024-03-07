import { saveAuthUser, clearStorage } from "../utils/helper";

const signupAction = (res) => (dispatch) => {
  dispatch({
    type: "Signup",
    payload: {
      authUserName: res?.data?.user_name,
      token: res?.headers?.authorization,
    },
  });
};

const loginAction = (res) => (dispatch) => {
  debugger;
  dispatch({
    type: "Login",
    payload: {
      authUserName: res?.data?.data?.name,
      token: res?.headers?.authorization,
      authority_client_pages: res?.data?.authority_client_pages,
    },
  });
  saveAuthUser(
    res?.data?.data?.name,
    res?.headers?.authorization,
    res?.data?.authority_client_pages
  );
};

const logoutAction = (dispatch) => {
  clearStorage();
  dispatch({ type: "Logout" });
};

const authActions = {
  signupAction,
  loginAction,
  logoutAction,
};

export default authActions;
