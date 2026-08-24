export const getAppRole = () => {
  return sessionStorage.getItem("app_role") || "user";
};

export const isOrganizer = () => {
  return getAppRole() === "organizer";
};
