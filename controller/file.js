const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadFolderPath = "uploads";
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const fileModel = require("../model/file");

dotenv.config();

const transpoter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: "kamalbisht819@gmail.com",
    pass: "wtsm fesn dspb fcoi",
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolderPath),
  filename: (req, file, cb) => {
    // console.log(file);
    const filename = uuidv4() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  console.log("filefiter :", file);
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024,
  // },
  fileFilter: fileFilter,
}).single("attachment");

const uploadFile = (req, res) => {
  upload(req, res, async (error) => {
    if (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.log(req.file);
    const fileData = {
      originalName: req.file.originalname,
      newName: req.file.filename,
      size: req.file.size,
    };
    const newlyInsertedFile = await fileModel.create(fileData);
    res.json({
      success: true,
      message: "Upload the File sucessfully",
      fileId: newlyInsertedFile._id,
    });
  });
};

const generateSharableLink = async (req, res) => {
  const fileId = req.params.fileId;
  if (!fileId) {
    return res
      .status(500)
      .json({ success: false, message: "Entre the file id" });
  }
  const fileData = await fileModel.findById(fileId);
  if (!fileData) {
    return res
      .status(500)
      .json({ success: false, message: "Enter vaild data" });
  }
  const shareableLink = `/files/download/${fileId}`;
  res.status(200).json({
    sucess: true,
    message: "generated successfully ",
    result: shareableLink,
  });
};

const downlodeFile = async (req, res) => {
  const fileId = req.params.fileId;
  const fileData = await fileModel.findById(fileId);
  console.log(fileData);
  const path = `uploads/${fileData.newName}`;
  res.download(path, fileData.originalName);
  // res.status(200).json({
  //   success: true,
  //   message: "downloadable file successfully generated",
  // });
};

const sendEmail = async (req, res) => {
  const fileId = req.body.fileId;
  const shareableLink = `${process.env.BASE_URL}/files/download/${fileId}`;
  console.log(req.body.email);
  //send mail
  const mailOptions = {
    to: req.body.email,
    from: "kamalbisht819@gmail.com",
    subject: "Test Mail",
    // text: "welcome to the test mail server",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Mail with Link</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  padding: 20px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border: 1px solid #dddddd;
                  border-radius: 5px;
                  max-width: 600px;
              }
              .header {
                  text-align: center;
                  padding-bottom: 10px;
              }
              .content {
                  text-align: left;
              }
              .content p {
                  line-height: 1.6;
              }
              .footer {
                  text-align: center;
                  padding-top: 10px;
                  font-size: 0.8em;
                  color: #666666;
              }
              .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #ffffff;
                  background-color: #007BFF;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 10px;
              }
              .btn:hover {
                  background-color: #0056b3;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to the Test Mail Server</h1>
              </div>
              <div class="content">
                  <p>Dear Bharat,</p>
                  <p>Welcome to our test mail server. This email is sent using Nodemailer and contains HTML content for better formatting and styling.</p>
                  <p>Click the button below to visit our website:</p>
                  <p><a href=${shareableLink} class="btn">Click Here</a></p>
                  <p>We hope you find this example helpful.</p>
              </div>
              <div class="footer">
                  <p>&copy; 2024 Test Mail Server. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };
  transpoter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "Mail not sent", error: err.message });
    } else {
      console.log(info);
      res.json({ success: true, message: "Mail sent successfully", info });
    }
  });
};

const controllerContainer = {
  uploadFile,
  generateSharableLink,
  downlodeFile,
  sendEmail,
};

module.exports = controllerContainer;
