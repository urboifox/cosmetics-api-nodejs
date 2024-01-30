const appError = (
  statusCode: number,
  statusMessage: string,
  message: string,
  errors?: any
) => {
  const err = {
    statusCode,
    statusMessage,
    message,
    errors,
  };
  return err;
};

export { appError };
