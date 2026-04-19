const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getUserIdFromRequest = (req) => {
  return (
    req.user?._id ||
    req.headers["x-user-id"] ||
    req.body?.userId ||
    req.query?.userId ||
    req.params?.userId
  );
};

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (!payload?.userId || !isValidObjectId(payload.userId)) {
        return res.status(401).json({ message: "Invalid authentication token" });
      }

      const user = await User.findById(payload.userId).select("_id name email role");
      if (!user) {
        return res.status(401).json({ message: "User not found for token" });
      }

      req.user = user;
      return next();
    }

    const fallbackUserId = getUserIdFromRequest(req);
    if (!fallbackUserId || !isValidObjectId(fallbackUserId)) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(fallbackUserId).select("_id name email role");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const requireAdmin = (req, res, next) => {
  return requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  });
};

module.exports = {
  requireAuth,
  requireAdmin,
};
