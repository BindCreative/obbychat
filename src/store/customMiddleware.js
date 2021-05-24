const customMiddleware = ({ dispatch, getState }) => (next) => (action) => {
  const mainKey = getState().temporary.currentWif;
  return next({ ...action, mainKey });
};

export default customMiddleware;
