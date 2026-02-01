import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'id',
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      id: {
        translation: {
          nav: { journal: "Jurnal", search: "Cari" },
          home: {
            welcome: "Inspirasi Masak Harian",
            subtitle: "Jelajahi rasa otentik dari 20 negara & cerita kuliner terbaik.",
            widget_title: "Jelajah Resep Negara",
            trending_title: "Resep Masakan Jadi",
            view_all_recipes: "Lihat Semua Resep →",
            journal_title: "Postingan Saya",
            view_all_journal: "Lihat Semua →",
            read_more: "Baca selengkapnya...",
            read_article: "BACA &raquo;",
            review_badge: "ULASAN",
            no_journal: "Belum ada artikel jurnal.",
            date_format: "id-ID"
          },
          countries: {
            indonesia: "Indonesia", japan: "Jepang", italy: "Italia", korea: "Korea",
            thailand: "Thailand", usa: "Amerika", china: "China", india: "India",
            mexico: "Meksiko", france: "Prancis", turkey: "Turki", vietnam: "Vietnam",
            uk: "Inggris", spain: "Spanyol", malaysia: "Malaysia", germany: "Jerman",
            brazil: "Brasil", philippines: "Filipina", russia: "Rusia", greece: "Yunani"
          },
          common: { 
            loading: "Memuat...", 
            back: "Kembali", 
            by: "Oleh", 
            not_found: "Resep Tidak Ditemukan" 
          }
        }
      },
      en: {
        translation: {
          nav: { journal: "Journal", search: "Search" },
          home: {
            welcome: "Daily Cooking Inspiration",
            subtitle: "Explore authentic flavors from 20 countries & best culinary stories.",
            widget_title: "Explore Recipes by Country",
            trending_title: "Finished Recipes",
            view_all_recipes: "View All Recipes →",
            journal_title: "My Posts",
            view_all_journal: "View All →",
            read_more: "Read more...",
            read_article: "READ &raquo;",
            review_badge: "REVIEW",
            no_journal: "No journal articles yet.",
            date_format: "en-US"
          },
          countries: {
            indonesia: "Indonesia", japan: "Japan", italy: "Italy", korea: "Korea",
            thailand: "Thailand", usa: "USA", china: "China", india: "India",
            mexico: "Mexico", france: "France", turkey: "Turkey", vietnam: "Vietnam",
            uk: "United Kingdom", spain: "Spain", malaysia: "Malaysia", germany: "Germany",
            brazil: "Brazil", philippines: "Philippines", russia: "Russia", greece: "Greece"
          },
          common: { 
            loading: "Loading...", 
            back: "Back", 
            by: "By", 
            not_found: "Recipe Not Found" 
          }
        }
      }
    }
  });

export default i18n;