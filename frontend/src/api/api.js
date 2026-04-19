const BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = (userId) => {
  const token = localStorage.getItem("token");
  const resolvedUserId = userId || localStorage.getItem("userId");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (resolvedUserId) {
    headers["x-user-id"] = resolvedUserId;
  }

  return headers;
};

const toJson = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return toJson(res);
};

export const getProductById = async (productId) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`);
  return toJson(res);
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const addToCart = async (data) => {
  const res = await fetch(`${BASE_URL}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const getCart = async (userId) => {
  const res = await fetch(`${BASE_URL}/cart/${userId}`);
  return toJson(res);
};

export const removeFromCart = async (data) => {
  const res = await fetch(`${BASE_URL}/cart/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const updateCartQuantity = async (data) => {
  const res = await fetch(`${BASE_URL}/cart/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const clearCart = async (data) => {
  const res = await fetch(`${BASE_URL}/cart/clear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const placeOrder = async (data) => {
  const res = await fetch(`${BASE_URL}/orders/place`, {
    method: "POST",
    headers: getAuthHeaders(data?.userId),
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const getOrders = async (userId) => {
  const res = await fetch(`${BASE_URL}/orders/${userId}`, {
    headers: getAuthHeaders(userId),
  });
  return toJson(res);
};

export const createProduct = async (data) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const updateProduct = async (productId, data) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return toJson(res);
};

export const deleteProduct = async (productId) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return toJson(res);
};

export const getAdminReport = async () => {
  const res = await fetch(`${BASE_URL}/orders/admin/report`, {
    headers: getAuthHeaders(),
  });

  return toJson(res);
};

export const getAllOrdersForAdmin = async () => {
  const res = await fetch(`${BASE_URL}/orders/admin/all`, {
    headers: getAuthHeaders(),
  });

  return toJson(res);
};

