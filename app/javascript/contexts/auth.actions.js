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
  dispatch({
    type: "Login",
    payload: {
      login_id: res?.data?.data?.name,
      token: res?.headers?.authorization,
      permissionPages: JSON.stringify(res?.data?.permission_pages),
    },
  });

  saveAuthUser(
    res?.data?.data?.name,
    res?.headers?.authorization,
    JSON.stringify(res?.data?.permission_pages)
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
