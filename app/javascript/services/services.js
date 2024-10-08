import { loginURL, logoutURL, signupURL } from "../utils/constants";

import { getAuthUserToken, API } from "../utils/helper";

// const verifyAuth = async (token = getAuthUserToken()) =>
//   makeHttpReq(verifyAuthURL, makeURLOptionsWtoken(token));

const login = async (payload) => {
  return API.post(loginURL, payload);
};

const signup = (payload) => API.post(signupURL, payload);

const logout = async () => API.delete(logoutURL, getAuthUserToken());
// makeHttpReq(
//   logoutURL,
//   makeURLOptionsWtoken(getAuthUserToken(), {}, "DELETE")
// );

const services = {
  signup,
  login,
  logout,
};

export default services;
