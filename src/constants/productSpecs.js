// src/constants/productSpecs.js

export const SPEC_LABELS = [
  "CPU (Bộ vi xử lý)",
  "Ram (Bộ nhớ trong)",
  "Storage (Ổ cứng)",
  "Màn hình",
  "Card đồ họa",
];

export const SPEC_DEFAULTS = [
  "Intel Core i7 13650HX (14 nhân 20 luồng, 2.6GHz, turbo 4.9GHz, 24MB Cache).",
  "16GB DDR5 có thể nâng cấp được.",
  "512GB SSD M.2 PCIe NVMe.",
  "15.6 inch FHD 144Hz IPS 100% sRGB.",
  "NVIDIA GeForce RTX 4060 8GB GDDR6.",
];

const getValueByKeys = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const parseFromObject = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  const cpu = getValueByKeys(obj, ["cpu", "CPU", "processor"]);
  const ram = getValueByKeys(obj, ["ram", "RAM", "memory"]);
  const storage = getValueByKeys(obj, ["storage", "ssd", "disk", "rom"]);
  const screen = getValueByKeys(obj, ["screen", "display", "monitor"]);
  const gpu = getValueByKeys(obj, ["gpu", "vga", "graphics", "card"]);

  return [cpu, ram, storage, screen, gpu].map((value, index) => value || SPEC_DEFAULTS[index]);
};

export const parseProductSpecs = (rawSpecs = "") => {
  if (rawSpecs && typeof rawSpecs === "object") {
    const objectValues = parseFromObject(rawSpecs);
    if (objectValues) {
      return SPEC_LABELS.map((label, index) => ({
        label,
        value: objectValues[index],
      }));
    }
  }

  const specString = String(rawSpecs || "").trim();
  if (!specString) {
    return SPEC_LABELS.map((label, index) => ({
      label,
      value: SPEC_DEFAULTS[index],
    }));
  }

  if (specString.startsWith("{") && specString.endsWith("}")) {
    try {
      const parsedObject = JSON.parse(specString);
      const objectValues = parseFromObject(parsedObject);
      if (objectValues) {
        return SPEC_LABELS.map((label, index) => ({
          label,
          value: objectValues[index],
        }));
      }
    } catch {
      // Ignore and continue with string parsing.
    }
  }

  const pipeValues = specString
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  if (pipeValues.length >= 2) {
    return SPEC_LABELS.map((label, index) => ({
      label,
      value: pipeValues[index] || SPEC_DEFAULTS[index],
    }));
  }

  const lineValues = specString
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (lineValues.length >= 2) {
    return SPEC_LABELS.map((label, index) => ({
      label,
      value: lineValues[index] || SPEC_DEFAULTS[index],
    }));
  }

  // Single short description is not reliable for full spec table.
  return SPEC_LABELS.map((label, index) => ({
    label,
    value: SPEC_DEFAULTS[index],
  }));
};
