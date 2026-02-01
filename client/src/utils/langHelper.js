/**
 * Fungsi untuk mendapatkan data berdasarkan bahasa yang dipilih
 */
export const getLocalized = (data, field, lang) => {
  if (!data) return "";

  const isEn = lang === "en";

  // Khusus untuk field steps_data, kita cek kolom JSON steps_data_en
  if (field === "steps_data") {
    return isEn && data.steps_data_en ? data.steps_data_en : data.steps_data;
  }

  // Untuk field teks biasa (title, description, country)
  const enField = `${field}_en`;
  if (isEn && data[enField]) {
    return data[enField];
  }

  return data[field] || "";
};