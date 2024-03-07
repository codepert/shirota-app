export const createSuccessState = (data) => {
  return { data, error: undefined, type: "success" };
};

export const createFailState = (message) => {
  return { data: { status: "error" }, error: message, type: "fail" };
};

export const isInitState = (data) => {
  return data === undefined;
};

export const isFailState = (data) => {
  return (
    !isInitState(data) && !isLoadingState(data) && data.error !== undefined
  );
};

export const HttpResponseErrorMessage = (code, status) => {
  let message = "";
  if (code == "ERR_NETWORK") {
    message = "Network error";
  } else {
    switch (status) {
      case 401:
        message = "invalid login ID or password.";
        break;
      case 500:
        message = "Internal server error.";
        break;
      case 404:
        message = "Not found.";
        break;
      default:
        break;
    }
  }
  return message;
};
