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
