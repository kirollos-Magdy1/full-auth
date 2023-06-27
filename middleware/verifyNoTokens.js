const CustomError = require("../errors");

const verifyNoTokens = (req, res, next) => {
  const accessToken = req.signedCookies.accessToken;
  const refreshToken = req.signedCookies.refreshToken;

  console.log("accessToken:", accessToken);
  console.log("refreshToken:", refreshToken);

  if (accessToken || refreshToken)
    throw new CustomError.BadRequestError("user already logged in");
  next();
};

module.exports = { verifyNoTokens };
