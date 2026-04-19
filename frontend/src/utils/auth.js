export const getStoredUser = () => {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  if (!userId) {
    return null;
  }

  return {
    userId,
    userName: userName || "",
    userEmail: userEmail || "",
    userRole: userRole || "customer",
    token: token || "",
  };
};

export const saveUserSession = (user) => {
  if (!user?._id) {
    return;
  }

  localStorage.setItem("userId", user._id);
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userEmail", user.email || "");
  localStorage.setItem("userRole", user.role || "customer");

  if (user.token) {
    localStorage.setItem("token", user.token);
  }
};

export const clearUserSession = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("token");
};

export const isAdminUser = (user) => user?.userRole === "admin";
