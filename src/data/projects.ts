import { Project } from '@/types';

/**
 * Sample project data
 * Replace this with your actual projects
 */
export const projects: Project[] = [
  {
    slug: 'lms-ruanganagata',
    title: 'Ruang Anagata',
    shortDescription: 'A comprehensive Learning Management System built with Laravel, serving 2000+ active users.',
    image: '/images/projects/lms-ruanganagata.png',
    fullContent: `
# Ruang Anagata

## Overview
A full-featured Learning Management System designed for educational institutions and corporate training programs. The platform handles course management, student enrollment, assessments, and real-time progress tracking.

## Key Features
- **Course Management**: Create and organize courses with multimedia content
- **Student Dashboard**: Track progress, grades, and upcoming assignments
- **Real-time Notifications**: WebSocket integration for instant updates
- **Assessment Engine**: Automated grading with support for multiple question types
- **Analytics Dashboard**: Comprehensive reporting for instructors and administrators

## Technical Highlights
- Built with **Laravel 10** for robust backend API
- **React 18** with TypeScript for type-safe frontend
- **PostgreSQL** database with optimized queries for large datasets
- **Redis** caching for improved performance
- **Docker** containerization for consistent deployment

## Challenges Solved
- Implemented real-time collaboration features using Laravel Echo and Pusher
- Optimized database queries to handle 10,000+ concurrent users
- Built a flexible RBAC (Role-Based Access Control) system
- Integrated third-party video conferencing APIs

## Results
- Successfully deployed to production serving 10,000+ active users
- Reduced page load times by 60% through caching strategies
- Achieved 99.9% uptime over 12 months
    `,
    technologies: ['Laravel', 'MySQL', 'Livewire', 'Tailwind CSS', 'Redis', 'Docker'],
    category: 'Web Dev',
    github: 'https://ruanganagata.id',
    year: 2025,
  },
{
  slug: 'esg-sentiment-analysis',
  title: 'ESG Sentiment Analysis System',
  shortDescription: 'Sistem analisis sentimen berbasis NLP untuk data Environmental, Social, and Governance (ESG) menggunakan Transformer dan Streamlit.',
  image: '/images/projects/esg-sentiment.png',
  fullContent: `
# ESG Sentiment Analysis System

## Overview
Proyek ini bertujuan untuk menganalisis sentimen dari berbagai sumber data (berita, laporan tahunan, dan media sosial) terkait kriteria Environmental, Social, and Governance (ESG). Sistem ini membantu investor dan perusahaan dalam memantau risiko reputasi dan kepatuhan ESG secara real-time.

## Problem Statement
Klien membutuhkan cara otomatis untuk menganalisis volume data tekstual yang besar guna menentukan persepsi publik dan tingkat risiko terkait isu-isu ESG, yang sebelumnya dilakukan secara manual dan memakan waktu lama.

## Solution Architecture
- **Data Pipeline**: Pipeline ETL otomatis yang memproses 500K+ record data tekstual dari berbagai API berita dan laporan publik.
- **Feature Engineering**: Ekstraksi fitur NLP termasuk TF-IDF, Word Embeddings (Word2Vec/GloVe), dan sentimen skor per kategori ESG (E, S, dan G).
- **Model**: Implementasi model berbasis Transformer (Fine-tuned BERT) untuk klasifikasi sentimen multi-class (Positif, Negatif, Netral).
- **Deployment**: Dashboard interaktif berbasis **Streamlit** untuk visualisasi tren sentimen dan analisis mendalam (drill-down).

## Technical Stack
- **Python 3.11** untuk pemrosesan bahasa alami (NLP) dan pemodelan.
- **Pandas & NumPy** untuk manipulasi data terstruktur.
- **Hugging Face Transformers** untuk implementasi model BERT.
- **Scikit-learn** untuk preprocessing dan evaluasi model klasik.
- **SQL** untuk manajemen data warehouse hasil analisis.
- **Streamlit** untuk dashboard visualisasi real-time.

## Key Accomplishments
- Mencapai **akurasi 87%** dan **F1-score 0.82** dalam klasifikasi sentimen spesifik domain keuangan/ESG.
- Mengidentifikasi 10 indikator risiko ESG utama melalui analisis SHAP untuk transparansi keputusan model.
- Mengurangi *false positives* sebesar 35% melalui teknik *ensemble learning* pada model klasifikasi.
- Memproses dan menganalisis data historis selama 2 tahun (lebih dari 2 juta record teks).

## Impact
- Memungkinkan strategi investasi berbasis data yang lebih cepat dengan pemantauan risiko ESG otomatis.
- Mengurangi waktu analisis laporan ESG manual hingga 70%.
- Meningkatkan deteksi dini terhadap isu negatif ESG sebesar 40% sebelum menjadi krisis reputasi.

## Technical Challenges
- **Data Unstructured**: Menangani ekstraksi teks dari laporan PDF yang kompleks dan data media sosial yang tidak rapi.
- **Sentiment Nuance**: Mendeteksi nuansa bahasa finansial yang seringkali berbeda dari sentimen umum (misal: kata "growth" dalam konteks emisi karbon bisa bernilai negatif).
- **Model Interpretability**: Menggunakan SHAP untuk menjelaskan mengapa model memberikan label sentimen tertentu pada dokumen tertentu.
- **Scalability**: Optimasi pipeline untuk memproses 100K artikel berita harian dalam waktu kurang dari 5 menit.
  `,
  technologies: ['Python', 'Transformers', 'Streamlit', 'Pandas', 'BERT', 'NLP'],
  category: 'Data Science',
  github: 'https://github.com/Harinzu47/ESG_Sentiment',
  year: 2024,
},
{
  slug: 'larvago',
  title: 'Larvago: Maggot Sales Platform',
  shortDescription: 'A web-based marketplace application specifically for BSF maggot products and organic waste management using the TALL Stack.',
  image: '/images/projects/larvago.png',
  fullContent: `
# Larvago: Maggot & Organic Waste Marketplace

## Overview
Larvago is an innovative e-commerce solution that connects maggot (Black Soldier Fly) breeders with consumers. This application is designed to simplify the distribution of high-protein alternative feed while supporting a sustainable organic waste management ecosystem.

## Key Features
- **Cultivation Dashboard**: A specialized feature for sellers to manage maggot stock based on their life cycle stage (fresh, dried, or eggs).
- **Interactive Shopping**: A seamless shopping experience with real-time cart updates and product filters.
- **Order Management**: An automated order tracking system from payment status to delivery.
- **Payment Integration**: Supports various local payment methods to facilitate transactions for maggot farmers.
- **Reporting System**: Sales reports and stock statistics to help sellers analyze their business growth.

## Technical Implementation
- **Laravel**: Serving as the core engine, providing a robust security system and application architecture.
- **Livewire**: Used to build a dynamic and interactive interface (such as search and shopping carts) without leaving the PHP ecosystem.
- **Tailwind CSS**: Provides a modern, clean, and fully responsive interface design for both mobile and desktop devices.
- **MySQL**: A relational database to store transaction, product, and user data with high data integrity.

## Results
- Accelerated the transaction process between breeders and buyers by up to 50% compared to manual methods.
- Provided a centralized catalog for various maggot derivative products (organic fertilizer, dried maggots, etc.).
- A lightweight and fast interface, ensuring easy access for users in areas with limited internet connectivity.
    `,
  technologies: ['Laravel', 'Livewire', 'Tailwind CSS', 'MySQL'],
  category: 'Web Dev',
  year: 2025,
},
{
  slug: 'unruly-webstore-app',
  title: 'Unruly Webstore Application',
  shortDescription: 'A comprehensive e-commerce platform for selling various goods, built with the TALL stack and integrated with real-time shipping APIs.',
  image: '/images/projects/unruly-webstore.png',
  fullContent: `
# Universal Webstore Application

## Overview
This Webstore App is a versatile e-commerce solution designed to handle various product types. It focuses on providing a seamless shopping experience with real-time updates and accurate shipping calculations for the Indonesian market.

## Key Features
- **Dynamic Product Catalog**: Efficiently browse and filter products across multiple categories.
- **Real-time Notifications**: Instant alerts for order status changes and stock updates powered by Pusher.
- **Shipping Cost Integration**: Accurate, real-time shipping rate calculations using the RajaOngkir API.
- **Interactive Shopping Cart**: A smooth, no-refresh cart management system built with Livewire.
- **Order Management System**: End-to-end tracking from checkout to delivery.
- **Performance Caching**: Optimized page load speeds using Redis for frequently accessed data.

## Technical Implementation
- **Laravel**: The core PHP framework providing robust security and scalable architecture.
- **Livewire**: Enabling reactive frontend components and a dynamic user experience without leaving the PHP ecosystem.
- **MySQL**: A reliable relational database for managing complex product, user, and transaction data.
- **Redis**: Used as a high-performance cache to ensure sub-second response times.
- **Tailwind CSS**: A utility-first CSS framework ensuring a modern, responsive, and clean user interface.
- **Pusher**: Implementing WebSocket technology for real-time communication and live updates.
- **RajaOngkir API**: Integrated to provide precise shipping costs from various Indonesian couriers.

## Results
- Successfully integrated real-time logistics, reducing shipping calculation errors.
- Improved user engagement through reactive UI components and instant notifications.
- Achieved high performance and scalability by leveraging Redis caching for product listings.
    `,
  technologies: ['Laravel', 'Livewire', 'MySQL', 'Redis', 'Tailwind CSS', 'Reverb', 'RajaOngkir API'],
  category: 'Web Dev',
  year: 2025,
},
{
  slug: 'imm-ft-umj-blog',
  title: 'IMM FT UMJ Blog Application',
  shortDescription: 'A dedicated organizational blog platform for IMM FT UMJ featuring real-time interactions and a dynamic content management system.',
  image: '/images/projects/immftumj-blog-app.png',
  fullContent: `
# IMM FT UMJ Blog Application

## Overview
This application serves as the official digital publication platform for the Ikatan Mahasiswa Muhammadiyah (IMM) at the Faculty of Engineering, Universitas Muhammadiyah Jakarta. It is designed to centralize organizational news, academic articles, and event updates for students and faculty members.

## Key Features
- **Dynamic Article Management**: A streamlined system for creating, editing, and categorizing blog posts with rich media support.
- **Real-time Notifications**: Instant updates for new comments and announcements, powered by Pusher.
- **Interactive Comments**: A reactive commenting system that allows members to engage in discussions without page reloads.
- **Member Directory**: A dedicated section to showcase the organization's structure and active members.
- **Responsive Layout**: A modern, mobile-first design ensuring accessibility across all devices.

## Technical Implementation
- **Laravel**: The foundational framework ensuring secure authentication, robust routing, and a scalable backend.
- **Livewire**: Utilized to build a dynamic frontend experience, enabling high interactivity while maintaining a clean PHP-based codebase.
- **Tailwind CSS**: A utility-first CSS framework used to craft a professional, custom-branded UI consistent with IMM's identity.
- **MySQL**: The relational database used for structured storage of articles, user profiles, and organizational data.
- **Pusher**: Integrated to provide real-time WebSocket capabilities for live user interactions and system alerts.

## Results
- Centralized all organizational communication into a single, professional digital hub.
- Enhanced member engagement through real-time discussion features.
- Significantly reduced the time required for admins to publish and manage organizational content.
    `,
  technologies: ['Laravel', 'Livewire', 'Tailwind CSS', 'MySQL', 'Pusher'],
  category: 'Web Dev',
  year: 2025,
},
{
  slug: 'sugar-control-app',
  title: 'Sugar Control: Personalized Meal Recommendations',
  shortDescription: 'Discover personalized meal recommendations tailored to your blood glucose levels using JavaScript and the Spoonacular API.',
  image: '/images/projects/sugar-control-app.png',
  fullContent: `
# Sugar Control: Take Control of Your Blood Sugar

## Overview
Sugar Control is a health-focused web application designed to help users manage their blood glucose through smarter dietary choices. By leveraging real-time data from the Spoonacular API, the app provides personalized meal recommendations that align with the user's current blood sugar levels, making healthy eating both simple and effective.

## Key Features
- **Personalized Recommendations**: Get meal suggestions tailored specifically to your blood glucose readings and dietary needs.
- **Nutritional Insights**: View detailed breakdowns of calories, carbs, and sugars for every recommended meal.
- **Smart Search**: Filter recipes based on ingredients, prep time, and health scores.
- **Responsive Interface**: A clean, mobile-friendly design that allows users to check recommendations on the go.
- **Direct Recipe Access**: Quick links to full cooking instructions and ingredient lists.

## Technical Implementation
- **HTML5 & CSS3**: Providing the foundational structure and custom styling for a polished look.
- **JavaScript (ES6+)**: Handling the core logic, including API fetching, data filtering, and dynamic DOM updates.
- **Bootstrap 5**: Utilized for a responsive grid system and modern UI components to ensure a seamless experience across all devices.
- **Spoonacular API**: Integrated to fetch a vast database of recipes, nutritional information, and health-specific dietary data.

## Results
- Successfully bridged the gap between glucose monitoring and actionable dietary planning.
- Created a fast, lightweight web application with zero backend overhead by utilizing client-side API integration.
- Improved user accessibility to healthy meal options through an intuitive and responsive interface.
    `,
  technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap 5', 'Spoonacular API'],
  category: 'Web Dev',
  year: 2023,
},
{
  slug: 'imm-ft-umj-shorten-link',
  title: 'IMM FT UMJ Shorten Link App',
  shortDescription: 'A custom URL shortening service for the IMM FT UMJ organization, built with React and Supabase for efficient link management.',
  image: '/images/projects/immftumj-shorten-link.png',
  fullContent: `
# IMM FT UMJ Shorten Link App

## Overview
This application is a specialized URL shortening service designed for the Ikatan Mahasiswa Muhammadiyah (IMM) at the Faculty of Engineering, Universitas Muhammadiyah Jakarta. It allows the organization to create clean, branded, and trackable short links for event registrations, digital publications, and social media sharing.

## Key Features
- **Custom Alias Creation**: Generate short URLs with custom suffixes that reflect the organization's branding.
- **Link Analytics**: Track the number of clicks and basic visitor data for every shortened link.
- **Dashboard Management**: A secure admin panel for members to manage, edit, or delete existing links.
- **Instant Redirects**: High-speed URL redirection ensuring a smooth experience for users.
- **Clipboard Integration**: One-click copying of shortened links for immediate sharing.

## Technical Implementation
- **React**: Used to build a fast, component-based user interface for the link management dashboard.
- **Supabase**: Serves as the backend-as-a-service (BaaS), providing a PostgreSQL database, real-time subscriptions, and secure authentication.
- **Supabase Auth**: Implemented to ensure that only authorized IMM members can create and manage organizational links.
- **Tailwind CSS**: Utilized for creating a modern, mobile-responsive, and professional UI.
- **Lucide React**: Integrated for clean and consistent iconography throughout the application.

## Results
- Streamlined the organization's digital presence by replacing long, messy URLs with professional branded links.
- Provided actionable insights through click tracking, helping the team measure the reach of their campaigns.
- Developed a highly scalable and cost-effective solution by leveraging Supabase's serverless architecture.
    `,
  technologies: ['React', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
  category: 'Web Dev',
  year: 2024,
},
{
  slug: 'warung-gembul-app',
  title: 'Warung Gembul App',
  shortDescription: 'A Progressive Web App (PWA) for restaurant discovery, featuring offline capabilities, optimized performance, and comprehensive automated testing.',
  image: '/images/projects/warung-gembul-app.png',
  fullContent: `
# Warung Gembul App

## Overview
Warung Gembul is a mobile-first restaurant catalogue application designed to provide a native-like experience on the web. Built as a Progressive Web App (PWA), it prioritizes accessibility, performance, and reliability, allowing users to explore culinary destinations even under unstable network conditions.

## Key Features
- **Progressive Web App (PWA)**: Installable on devices with full offline functionality using Service Workers.
- **Offline Favorites**: Users can "like" and save restaurants to their favorites list, which remains accessible without an internet connection (powered by IndexedDB).
- **Optimized Performance**: Implements image lazy-loading, code splitting, and asset compression for lightning-fast load times.
- **Responsive & Accessible**: A mobile-first interface designed with accessibility best practices (A11y), including skip-links and focus management.
- **Restaurant Discovery**: Detailed views of restaurant menus, ratings, and customer reviews sourced from an external API.

## Technical Implementation
- **Vanilla JavaScript**: Built with pure JavaScript (ES6+) for maximum performance and control, without reliance on heavy frontend frameworks.
- **Webpack**: configured for advanced asset bundling, image optimization (imagemin), and production-ready builds.
- **Workbox**: Utilized for managing Service Worker caching strategies (Stale-While-Revalidate, Network-First, Cache-First) to ensure offline resilience.
- **IndexedDB**: Client-side database implementation for storing favorite restaurant data persistently in the browser.
- **Automated Testing**:
    - **E2E Testing**: End-to-End user scenarios automated with **CodeceptJS**.
    - **Unit/Integration Testing**: Component logic verified using **Jasmine** and **Karma**.
- **Linting**: Code quality maintained using **ESLint** with the strict **Airbnb** style guide.

## Results
- Delivered a highly performant web application capable of running smoothly on low-spec devices.
- Achieved a robust offline experience, increasing user retention in areas with poor connectivity.
- Maintained high code stability and minimal regression through a comprehensive suite of automated tests.
    `,
  technologies: ['JavaScript (ES6+)', 'Webpack', 'Workbox (PWA)', 'IndexedDB', 'CodeceptJS', 'Jasmine', 'Karma'],
  category: 'Web Dev',
  year: 2023,
},
];

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(category: Project['category']): Project[] {
  return projects.filter((project) => project.category === category);
}
