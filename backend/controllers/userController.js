const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    const savedUser = await user.save();

   const token = jwt.sign({ userId: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

res.status(201).json({
  message: "User registered",
  token,
  user: {
    _id: savedUser._id,
    name: savedUser.name,
    email: savedUser.email,
    role: savedUser.role,
  },
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

res.json({
  message: "Login successful",
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
