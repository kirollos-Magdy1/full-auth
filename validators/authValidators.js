const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const User = require("../models/User");
const CustomError = require("../errors");

const registerValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 50 })
    .withMessage("Too long User name"),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          throw new CustomError.BadRequestError("Email already exists");
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body["password-confirm"]) {
        throw new Error("Password did not match");
      }
      return true;
    }),
  validatorMiddleware,
];

const verifyEmailValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (!user) {
          throw new CustomError.UnauthenticatedError("Verification Failed");
        }
        const tenMinutes = 1000;

        if (Date.now() > user.verificationTokenCreationAt + tenMinutes)
          throw new CustomError.UnauthenticatedError(
            "verification token has expired"
          );
      })
    ),

  check("verificationToken")
    .notEmpty()
    .withMessage("VerificationToken required")
    .custom(async (val, { req }) => {
      const email = req.body.email;
      console.log(email);
      const user = await User.findOne({ email });
      if (user.verificationToken !== val) {
        throw new CustomError.UnauthenticatedError("Verification Failed");
      }
    }),

  validatorMiddleware,
];

const completeVerificationValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(val)))
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
      if (user.isVerified)
        throw new CustomError.BadRequestError("user already verified");
    }),

  validatorMiddleware,
];

const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(val)))
        throw new CustomError.UnauthenticatedError("Invalid Credentials");

      if (!user.isVerified)
        throw new CustomError.UnauthenticatedError("Please verify your email");
    }),

  validatorMiddleware,
];

module.exports = {
  registerValidator,
  verifyEmailValidator,
  loginValidator,
  completeVerificationValidator,
};
