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
  const username =
    res?.data?.data?.responsible_category_id == 1
      ? res?.data?.data?.name + "[本社]"
      : res?.data?.data?.name;
  dispatch({
    type: "Login",
    payload: {
      login_id: username,
      token: res?.headers?.authorization,
      permissionPages: JSON.stringify(res?.data?.permission_pages),
    },
  });

  saveAuthUser(
    username,
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
