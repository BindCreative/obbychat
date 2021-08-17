const customMiddleware = ({ dispatch, getState }) => (next) => (action) => {
  const mainKey = getState().temporary.hashedWif;
  return next({ ...action, mainKey });
};

export default customMiddleware;
