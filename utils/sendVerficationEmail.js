const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({ name, email, verificationToken }) => {
  const verifyEmail = `token=${verificationToken}`;

  const message = `<p>Please confirm your email by the following token
  ${verifyEmail} Verify Email with this token in no more than 10 minutes</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendVerificationEmail;
