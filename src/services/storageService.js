//import { seedUsers, seedItems, seedClaims, seedNotifications } from "../data / seedData";

// Storage Keys
const KEYS = {
  USERS: "traceit_users",
  ITEMS: "traceit_items",
  CLAIMS: "traceit_claims",
  NOTIFICATIONS: "traceit_notifications",
  CURRENT_USER: "traceit_current_user"
};

// Initialize LocalStorage with empty data if missing
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.ITEMS)) {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.CLAIMS)) {
    localStorage.setItem(KEYS.CLAIMS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

// --- USERS ---
export const getUsers = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
};

export const saveUser = (user) => {
  const users = getUsers();
  const index = users.findIndex(u => u.email === user.email);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push({ ...user, id: `user-${Date.now()}`, status: "Active", role: "student" });
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return user;
};

export const updateUserStatus = (userId, status) => {
  const users = getUsers();
  const updated = users.map(user =>
    user.id === userId ? { ...user, status } : user
  );
  localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
  return updated;
};

// --- ITEMS ---
export const getItems = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.ITEMS)) || [];
};

export const getItemById = (id) => {
  const items = getItems();
  return items.find(item => item.id === id);
};

export const saveItem = (item) => {
  const items = getItems();
  const newItem = {
    ...item,
    id: item.id || `${item.type}-${Date.now()}`,
    status: item.status || (item.type === "lost" ? "Active" : "Pending Review")
  };

  const index = items.findIndex(i => i.id === newItem.id);
  if (index >= 0) {
    items[index] = newItem;
  } else {
    items.unshift(newItem);
  }

  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
  return newItem;
};

export const deleteItem = (id) => {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(filtered));
  return filtered;
};

// --- CLAIMS ---
export const getClaims = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.CLAIMS)) || [];
};

export const getClaimsByClaimant = (email) => {
  const claims = getClaims();
  return claims.filter(claim => claim.claimantEmail === email);
};

export const getClaimById = (id) => {
  const claims = getClaims();
  return claims.find(claim => claim.id === id);
};

export const saveClaim = (claim) => {
  const claims = getClaims();
  const newClaim = {
    ...claim,
    id: claim.id || `claim-${Date.now()}`,
    dateClaimed: claim.dateClaimed || new Date().toISOString().split("T")[0],
    status: claim.status || "Pending"
  };

  const index = claims.findIndex(c => c.id === newClaim.id);
  if (index >= 0) {
    claims[index] = newClaim;
  } else {
    claims.unshift(newClaim);
  }

  localStorage.setItem(KEYS.CLAIMS, JSON.stringify(claims));
  return newClaim;
};

// --- NOTIFICATIONS ---
export const getNotifications = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS)) || [];
};

export const getNotificationsForUser = (email) => {
  const notifications = getNotifications();
  return notifications.filter(notif => notif.userEmail === email);
};

export const addNotification = (userEmail, title, message) => {
  const notifications = getNotifications();
  const newNotif = {
    id: `notif-${Date.now()}`,
    userEmail,
    title,
    message,
    date: new Date().toISOString().split("T")[0],
    read: false
  };
  notifications.unshift(newNotif);
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return newNotif;
};

export const markNotificationRead = (id) => {
  const notifications = getNotifications();
  const updated = notifications.map(notif =>
    notif.id === id ? { ...notif, read: true } : notif
  );
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  return updated;
};

// --- CURRENT USER / SESSION ---
export const getCurrentUser = () => {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};
