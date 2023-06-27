const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select(
    "-password -passwordResetExpiresAt -verificationTokenCreationAt -isVerified -verificationToken -verificationTokenExpiresAt -passwordResetVerified -passwordResetCode"
  );
  res.status(StatusCodes.OK).json({ users });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUserPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.user.userId);

  user.password = newPassword;

  await user.save();
  req.passwordChanged = true;
  next();
};

module.exports = {
  getAllUsers,
  showCurrentUser,
  updateUserPassword,
};
