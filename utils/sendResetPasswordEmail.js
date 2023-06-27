const sendEmail = require("./sendEmail");

const sendResetPassswordEmail = async ({ name, email, resetCode }) => {
  const message = `Hi ${name},\n We received a request to reset the password of your Account. \n ${resetCode} \n Enter this code to complete the reset.`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4>Hello, ${name}</h4>
   ${message}
   `,
  });
};

module.exports = sendResetPassswordEmail;
