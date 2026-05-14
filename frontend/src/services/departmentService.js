import API from "./api";

const appendIfDefined = (formData, key, value) => {
  if (value === undefined || value === null) return;
  formData.append(key, value);
};

const buildDepartmentFormData = (departmentData = {}) => {
  const formData = new FormData();
  const nestedKeys = ["name", "description", "directions", "services"];
  const fileKeys = ["departmentImageFile", "headImageFile"];

  Object.entries(departmentData).forEach(([key, value]) => {
    if (fileKeys.includes(key)) return;

    if (nestedKeys.includes(key)) {
      appendIfDefined(formData, key, JSON.stringify(value || {}));
      return;
    }

    if (Array.isArray(value)) {
      appendIfDefined(formData, key, JSON.stringify(value));
      return;
    }

    appendIfDefined(formData, key, value);
  });

  if (departmentData.departmentImageFile) {
    formData.append("departmentImage", departmentData.departmentImageFile);
  }

  if (departmentData.headImageFile) {
    formData.append("headImage", departmentData.headImageFile);
  }

  return formData;
};

export const departmentService = {
  // Get all departments with optional filters
  getAll: async (params = {}) => {
    try {
      const { data } = await API.get("/departments", { params });
      return data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Get single department by ID
  getById: async (id) => {
    try {
      const { data } = await API.get(`/departments/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  },

  // Get departments by building
  getByBuilding: async (building) => {
    try {
      const { data } = await API.get("/departments", { params: { building } });
      return data;
    } catch (error) {
      console.error("Error fetching departments by building:", error);
      throw error;
    }
  },

  // Get building statistics
  getBuildingStats: async () => {
    try {
      const { data } = await API.get("/departments/stats/buildings");
      return data;
    } catch (error) {
      console.error("Error fetching building stats:", error);
      throw error;
    }
  },

  // Get overall stats
  getStats: async () => {
    try {
      const { data } = await API.get("/departments/stats");
      return data;
    } catch (error) {
      console.error("Error fetching department stats:", error);
      throw error;
    }
  },

  // Create new department (admin only)
  create: async (departmentData) => {
    try {
      const formData = buildDepartmentFormData(departmentData);
      const { data } = await API.post("/departments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  },

  // Update department (admin only)
  update: async (id, departmentData) => {
    try {
      const formData = buildDepartmentFormData(departmentData);
      const { data } = await API.put(`/departments/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  },

  // Delete department (admin only)
  delete: async (id) => {
    try {
      const { data } = await API.delete(`/departments/${id}`);
      return data;
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  },
};
