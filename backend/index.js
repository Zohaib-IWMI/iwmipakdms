const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const saltRound = 10;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const db = mysql.createConnection({
  user: "root",
  host: "mysqldb",
  password: "72342",
  database: "pakdms",
});

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
); // Use the Docker-mounted uploads directory
const uploadDir = path.join("/uploads"); // Use the absolute path inside the Docker container

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(uploadDir));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save the files in the '/uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const newFileName = `${uniqueSuffix}-${file.originalname}`;
    cb(null, newFileName); // Rename file with unique suffix
  },
});

const upload = multer({ storage });

// Endpoint to handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Return the new file name to the frontend
  res.json({ fileName: req.file.filename });
});

const verifyJWT = (req, res, next) => {
  const token = req.headers["access-token"];

  if (!token) {
    res.send({
      auth: false,
      message: "Token missing",
    });
  } else {
    jwt.verify(token, "iwmipakdmsbylevant", (err, decoded) => {
      if (err) {
        if (err.name == "TokenExpiredError")
          res.json({
            auth: false,
            message: "Authentication Token has expired",
          });
        else
          res.json({
            auth: false,
            message: "You have failed to authenticate",
          });
      } else {
        res.json({
          auth: true,
          message: "Successfully authenticated",
        });
      }
    });
  }
};

app.post("/register", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const f_name = req.body.f_name;
  const l_name = req.body.l_name;
  const organization = req.body.organization;
  const purpose = req.body.purpose;
  bcrypt.hash(password, saltRound, (err, hash) => {
    if (err) {

    }
    db.execute(
      "INSERT INTO users (username, password, f_name, l_name, organization, purpose) VALUES (?,?,?,?,?,?)",
      [username, hash, f_name, l_name, organization, purpose],
      (err, result) => {
        if (result) {
          let transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            auth: {
              user: "iwmipk-wms@cgiar.org",
              pass: "rpnhmdmblyvlkntg",
            },
          });

          let message = {
            from: "PakDMS Daemon <iwmipk-wms@cgiar.org>",
            to: "Dr. M. Zohaib <m.zohaib@cgiar.org>",
            subject: "PakDMS User Registration",
            text:
              "A new user on PakDMS with user id: " +
              username +
              " has registered. Use Admin panel to approve their registration. Thank you",
          };

          transporter.sendMail(message, (error, info) => {
            if (error) {

              return process.exit(1);
            }
          });
          res.send({ reg: true });
        } else res.send({ reg: false });
      }
    );
  });
});

function encrypt(text) {
  const cipher = crypto.Cipher("aes-256-cbc", "EmailPasswordResetTrick");
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.Decipher("aes-256-cbc", "EmailPasswordResetTrick");
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.post("/forgot", (req, res) => {
  const username = req.body.email;
  try {
    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, data1, fields) => {
        if (data1.length == 0) {
          return res.send({
            forgot: false,
            msg: "No user with this email found, try again.",
          });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        const otpExpier = new Date();
        otpExpier.setMinutes(otpExpier.getMinutes() + 10);

        db.query(
          "UPDATE users SET otp = ?, otpExpire = ? WHERE username = ?",
          [otp, otpExpier, username],
          (err, data2, fields) => {
            const transporter = nodemailer.createTransport({
              host: "smtp.office365.com",
              port: 587,
              secure: false,
              tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
              },
              auth: {
                user: "iwmipk-wms@cgiar.org",
                pass: "rpnhmdmblyvlkntg",
              },
              // logger: true,
              // debug: true,
            });

            const mailOptions = {
              from: "iwmipk-wms@cgiar.org",
              to: username,
              subject: "Password reset OTP",
              html: `Generated OTP (It expires after 10 minutes) : ${otp}<br/> Use this <a href="https://pakdms.iwmi.org/resetpassword/${encrypt(
                username
              )}">Link</a> to reset password`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                res.send({
                  forgot: false,
                  msg: "An error occured while sending email, please re-try",
                });
              } else {
                res.send({
                  forgot: true,
                  msg: "An OTP has been sent to the email, use it to reset your password",
                });
              }
            });
          }
        );
      }
    );
  } catch (err) {}
});

app.post("/reset", (req, res) => {
  const otp = req.body.otp;
  const password = req.body.password;
  const id = req.body.id;
  try {
    db.query(
      "SELECT * FROM users WHERE otp = ? AND otpExpire > NOW()",
      [otp],
      async (err, data, fields) => {
        if (data.length == 0)
          return res.send({
            reset: true,
            msg: "OTP has expired, please use reset password form again. Thank you",
          });

        const hashedPassword = await bcrypt.hash(password, saltRound);

        db.query(
          "UPDATE users SET password = ?, otp = null, otpExpire = null WHERE otp = ? and username= ?",
          [hashedPassword, otp, decrypt(id)],
          async (err, data, fields) => {
            res.send({ reset: true, msg: "Password changed successfully" });
          }
        );
      }
    );
  } catch (err) {}
});

app.get("/logincheck", verifyJWT, (req, res) => {
  try {
    if (req.session.user) {
      res.send({ auth: true, loggedIn: true, user: req.session.user });
    } else {
      res.send({ auth: false, loggedIn: false });
    }
  } catch (e) {}
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.execute(
    "SELECT * FROM users WHERE username = ? and isApproved=1;",
    [username],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            db.execute(
              "SELECT admin,admin1,admin1Name,admin2,admin2Name FROM users WHERE username = ?;",
              [username],
              (err, result) => {
                if (err) {
                  res.send({ err: err });
                }
                if (result.length > 0) {
                  if (response) {
                    const id = result[0].id;
                    const token = jwt.sign({ id }, "iwmipakdmsbylevant", {
                      expiresIn: 6000,
                    });
                    res.json({
                      auth: true,
                      type: "success",
                      admin: result[0].admin,
                      admin1: result[0].admin1,
                      admin1Name: result[0].admin1Name,
                      admin2: result[0].admin2,
                      admin2Name: result[0].admin2Name,
                      token: token,
                    });
                  }
                } else {
                  res.json({
                    auth: false,
                    type: "error",
                    message: "User not found",
                  });
                }
              }
            );
          } else {
            res.json({
              auth: false,
              type: "error",
              message: "Incorrect password",
            });
          }
        });
      } else {
        res.json({
          auth: false,
          type: "error",
          message: "User not found or account still inactive.",
        });
      }
    }
  );
});

app.get("/getAllUsers", (req, res) => {
  db.execute(
    "SELECT id as uuid, f_name, l_name, username, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization,purpose FROM users where username <> 'user@example.com' and username <> 'cto@spatial.levantc.com'",
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        res.json({ results: result });
      } else {
        return res.json({ results: result });
      }
    }
  );
});

app.post("/updateUserDetails", (req, res) => {
  const cat = req.body.cat;
  const val = req.body.selectedValue;
  const key = req.body.key;
  let query;

  if (cat === "remove") {
    query = "delete from users where id='" + key + "'";
  } else if (cat === "admin1Name") {
    if (val === "")
      query =
        "Update users set " + cat + " = '" + val + "' where id='" + key + "'";
    else
      query =
        "Update users set " +
        cat +
        " = '" +
        val +
        "', admin1=1 where id='" +
        key +
        "'";
  } else if (cat === "admin2Name") {
    if (val === "")
      query =
        "Update users set " + cat + " = '" + val + "' where id='" + key + "'";
    else
      query =
        "Update users set " +
        cat +
        " = '" +
        val +
        "', admin1=1,admin2=1 where id='" +
        key +
        "'";
  } else {
    query =
      "Update users set " + cat + " = '" + val + "' where id='" + key + "'";
  }

  db.execute(query, (err, result) => {
    if (result) {
      // If this is an approval action, send an email to the user
      if (cat === "isApproved" && val === "1") {
        // First get the user's email
        db.execute(
          "SELECT username FROM users WHERE id = ?",
          [key],
          (err, userResult) => {
            if (err || !userResult.length) {

              return res.send({
                update: true,
                message:
                  "Changes applied, but failed to send notification email.",
              });
            }

            const userEmail = userResult[0].username;

            // Send approval email
            const transporter = nodemailer.createTransport({
              host: "smtp.office365.com",
              port: 587,
              secure: false,
              tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
              },
              auth: {
                user: "iwmipk-wms@cgiar.org",
                pass: "rpnhmdmblyvlkntg",
              },
            });

            const mailOptions = {
              from: "PakDMS Daemon <iwmipk-wms@cgiar.org>",
              to: userEmail,
              subject: "PakDMS Account Approval",
              html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5C4033;">Your PakDMS Account Has Been Approved</h2>
                <p>Congratulations! Your account on the Pakistan Drought Management System (PakDMS) has been approved by an administrator.</p>
                <p>You can now log in to your account using your registered email address and password at <a href="https://pakdms.iwmi.org/login">https://pakdms.iwmi.org/login</a>.</p>
                <p>Thank you for your interest in using PakDMS.</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {

                return res.send({
                  update: true,
                  message:
                    "Changes applied, but failed to send notification email.",
                });
              }


              res.send({
                update: true,
                message: "Changes applied and notification email sent to user.",
              });
            });
          }
        );
      } else {
        res.send({ update: true, message: "Changes applied" });
      }
    } else {
      res.send({ update: false, message: "Error occurred" });
    }
  });
});

app.get("/welcome", verifyJWT, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

const PORT = process.env.NODE_DOCKER_PORT || 8081;

app.listen(PORT, () => {});
