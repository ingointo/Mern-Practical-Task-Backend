const users = require("../models/userModel");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL = process.env.BASE_URL;

//register user
exports.userPostRegister = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !mobile ||
    !gender ||
    !location ||
    !status
  ) {
    res.status(401).json("All input is required");
  }

  try {
    //user is already registered || not
    const preUser = await users.findOne({ email: email });

    if (preUser) {
      res.status(401).json("User already exist in our datsabase");
    } else {
      const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
      const userData = new users({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateCreated,
      });
      await userData.save();
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error: " + error.message);
  }
};

//get user details
exports.userGet = async (req, res) => {
  const search = req.query.search || "";
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 6;
  const query = {
    fname: { $regex: search, $options: "i" },
  };
  try {
    const skip = (page - 1) * ITEM_PER_PAGE; // 1 * 6 = 0

    const count = await users.countDocuments(query);

    const usersData = await users.find(query).limit(ITEM_PER_PAGE).skip(skip);
    const pageCount = Math.ceil(count / ITEM_PER_PAGE);

    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      usersData,
    });
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error:" + error.message);
  }
};

//get single user details
exports.singleUserGet = async (req, res) => {
  const id = req.params.id;
  try {
    const userData = await users.findById(id);
    res.status(200).json(userData);
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error:" + error.message);
  }
};

//user Edit
exports.userEdit = async (req, res) => {
  const id = req.params.id;
  const {
    fname,
    lname,
    email,
    mobile,
    gender,
    location,
    status,
    user_profile,
  } = req.body;
  const file = req.file ? req.file.filename : user_profile;

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const updateUser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      },
      {
        new: true,
      }
    );
    await updateUser.save();
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error:" + error.message);
  }
};

//user Delete
exports.userDelete = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteUser = await users.findByIdAndDelete(id);
    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error:" + error.message);
  }
};

//change status
exports.userStatus = async (req, res) => {
  const id = req.params.id;
  const data = req.body.data;
  try {
    const userStatusUpdate = await users.findByIdAndUpdate(
      { _id: id },
      { status: data },
      { new: true }
    );
    res.status(200).json(userStatusUpdate);
  } catch (error) {
    res.status(401).json(error);
    console.log("Catch error:" + error.message);
  }
};

// export user
exports.userExport = async (req, res) => {
  try {
    const userData = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const writablestream = fs.createWriteStream(
      "public/files/export/users.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BASE_URL}/files/export/users.csv`,
      });
    });
    if (userData.length > 0) {
      userData.map((user) => {
        csvStream.write({
          FirstName: user.fname ? user.fname : "-",
          LastName: user.lname ? user.lname : "-",
          Email: user.email ? user.email : "-",
          Phone: user.mobile ? user.mobile : "-",
          Gender: user.gender ? user.gender : "-",
          Status: user.status ? user.status : "-",
          Profile: user.profile ? user.profile : "-",
          Location: user.location ? user.location : "-",
          DateCreated: user.dateCreated ? user.dateCreated : "-",
          DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
        });
      });
    }
    csvStream.end();
    writablestream.end();
  } catch (error) {
    res.status(401).json(error);
  }
};
