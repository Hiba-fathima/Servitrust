require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/UserModel");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("An admin account already exists.");
      return;
    }

    const name = "ServiTrust Admin";
    const email = "admin@servitrust.com";
    const password = "ChangeThisPassword123!";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("This email already exists. Choose another email.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();