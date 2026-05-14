export const sectorsData = [
  {
    id: 1,
    name: "Executive Leadership",
    description:
      "Minister's Office, Deputy Minister, and executive leadership overseeing ministry operations and strategic direction.",
    building: "A",
    floors: [6, 7, 8],
    departmentCount: 6,
    color: "#1E3A5F",
    icon: "🏛️",
  },
  {
    id: 2,
    name: "Innovation & Technology",
    description:
      "Technology center, innovation fund, startups, technology development, and R&D coordination.",
    building: "A",
    floors: [1, 2, 3, 5, 6],
    departmentCount: 6,
    color: "#078930",
    icon: "💡",
  },
  {
    id: 3,
    name: "Finance & Administration",
    description:
      "Treasury, procurement, audit, budget management, and financial administration.",
    building: "A",
    floors: [2, 3, 4],
    departmentCount: 4,
    color: "#F59E0B",
    icon: "💰",
  },
  {
    id: 4,
    name: "Policy & Strategy",
    description:
      "Policy affairs, strategic planning, national research and development coordination.",
    building: "A",
    floors: [3, 4, 5],
    departmentCount: 4,
    color: "#8B5CF6",
    icon: "📋",
  },
  {
    id: 5,
    name: "HR & Competency",
    description:
      "Human resources, secretariat, women and social resources, competency management.",
    building: "A",
    floors: [2, 3, 4],
    departmentCount: 4,
    color: "#EC4899",
    icon: "👥",
  },
  {
    id: 6,
    name: "Operations & Services",
    description:
      "General services, facility operations, registry, and building management.",
    building: "A/B",
    floors: [3, 1],
    departmentCount: 4,
    color: "#14B8A6",
    icon: "⚙️",
  },
  {
    id: 7,
    name: "Digital & ICT",
    description:
      "ICT services, e-government, digital economy, and technology infrastructure.",
    building: "A/B",
    floors: [1, 1, 2],
    departmentCount: 4,
    color: "#3B82F6",
    icon: "🌐",
  },
  {
    id: 8,
    name: "Support Services",
    description:
      "Data center, conference hall, TV room, and general support facilities.",
    building: "A",
    floors: [0, 1, 8],
    departmentCount: 4,
    color: "#6B7280",
    icon: "🛠️",
  },
];

// ========== HELPER FUNCTIONS ==========

// Get sector by ID
export const getSectorById = (id) => {
  return sectorsData.find((sector) => sector.id === parseInt(id));
};

// Get all sectors
export const getAllSectors = () => {
  return sectorsData;
};

// Get sectors by building
export const getSectorsByBuilding = (building) => {
  return sectorsData.filter((sector) => sector.building === building);
};

// Get total departments across all sectors
export const getTotalDepartments = () => {
  return sectorsData.reduce(
    (total, sector) => total + sector.departmentCount,
    0,
  );
};
// Get total sectors
export const getTotalSectors = () => {
  return sectorsData.length;
};
