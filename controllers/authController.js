const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require("../utils");
const crypto = require("crypto");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

const completeVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    msg: "Success! Please check your email to verify account",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = "";
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  const resMsg = req.passwordChanged
    ? "Success! Password Updated.\n logged out"
    : "user logged out!";
  res.status(StatusCodes.OK).json({ msg: resMsg });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    throw new CustomError.NotFoundError(
      `There is no user with that email ${email}`
    );

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  try {
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      resetCode,
    });
  } catch (error) {
    console.log(error);
  }

  console.log(user);

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Reset code sent to email" });
};

const verifyPassResetCode = async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    throw new CustomError.BadRequestError("Reset code invalid or expired");
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(StatusCodes.OK).json({
    msg: "Success",
  });
};

const resetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new CustomError.NotFoundError(
      `There is no user with email ${req.body.email}`
    );
  }

  if (!user.passwordResetVerified) {
    throw new CustomError.BadRequestError("Reset code not verified");
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  req.passwordChanged = true;
  res.status(StatusCodes.OK).json({ msg: "password has been reset" });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  completeVerification,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
};
