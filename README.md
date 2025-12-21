# Professional Portfolio Website

A modern, scalable portfolio website showcasing expertise as a Fullstack Developer and Data Scientist, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Tech-SaaS aesthetic with glassmorphism and gradient effects
- **Dual Expertise Showcase**: Separate sections for Software Engineering and Data Science projects
- **Dynamic Project Pages**: Slug-based routing with detailed case studies
- **Interactive Filtering**: Filter projects by category (Web Dev / Data Science)
- **Skills Visualization**: Recharts-powered radar chart showing skill distribution
- **Tech Stack Marquee**: Infinite scrolling animation showcasing technologies
- **Responsive Design**: Mobile-first approach with smooth animations
- **SEO Optimized**: Metadata, semantic HTML, and performance optimized

## 📁 Project Structure

```
khalid-portofolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── projects/[slug]/    # Dynamic project pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Atomic components (Button, Badge, Card)
│   │   ├── sections/           # Page sections (Hero, About, TechStack, ProjectsGrid)
│   │   └── layout/             # Navbar, Footer
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn for class merging)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── data/
│       └── projects.ts         # Project data with slugs
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 📦 Installation

Since PowerShell script execution might be restricted on your system, you can install dependencies using one of these methods:

### Method 1: Using npm directly
```bash
npm install
```

### Method 2: If npm doesn't work, try PowerShell bypass
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

### Method 3: Use Command Prompt instead
Open Command Prompt (cmd) and run:
```cmd
cd d:\Project\khalid-portofolio
npm install
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 📝 Customization Guide

### 1. Update Personal Information

**Navbar & Footer** (`src/components/layout/`):
- Replace social media links (GitHub, LinkedIn, Email)
- Update email address: `your.email@example.com`

**Hero Section** (`src/components/sections/Hero.tsx`):
- Modify the headline and subtitle
- Adjust gradient colors

### 2. Add Your Projects

Edit `src/data/projects.ts`:

```typescript
{
  slug: 'your-project-slug',           // URL-friendly identifier
  title: 'Project Title',
  shortDescription: 'Brief description for card',
  fullContent: `...`,                   // Markdown-style content
  technologies: ['React', 'Node.js'],
  category: 'Web Dev' | 'Data Science',
  github: 'https://github.com/...',    // Optional
  demo: 'https://...',                  // Optional
  year: 2024,                           // Optional
}
```

### 3. Update Skills Chart

Edit `src/components/sections/SkillsChart.tsx`:

```typescript
const skillsData = [
  { category: 'Your Skill', level: 90 },
  // Add more categories...
];
```

### 4. Modify Tech Stack

Edit `src/components/sections/TechStack.tsx`:

```typescript
const engineeringTech = [
  { name: 'Technology', icon: '🔷' },
  // Add your technologies...
];
```

### 5. Update About Section

Edit `src/components/sections/About.tsx` to update your bio and statistics.

### 6. Colors and Theme

Edit `tailwind.config.ts` to modify:
- Color schemes
- Animations
- Spacing
- Fonts

## 🎨 Design System

### Atomic Components (`components/ui/`)
- **Button**: 4 variants (primary, secondary, outline, ghost), 3 sizes
- **Badge**: 5 color variants for technology tags
- **Card**: Glassmorphism effect with hover animations

### Color Palette
- **Primary (Blue)**: Software Engineering focus
- **Secondary (Purple)**: Data Science focus
- **Background**: Dark gradients (slate-950, slate-900)
- **Accents**: Vibrant blues and purples

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔍 SEO Features

- Dynamic metadata per page
- OpenGraph tags
- Semantic HTML structure
- Optimized images and fonts
- Fast page load times

## 📄 License

MIT License - feel free to use this template for your own portfolio!

## 🤝 Contributing

This is a personal portfolio template. Feel free to fork and customize for your own use.

## 📧 Contact

- Email: harinzu47@gmail.com
- GitHub: [@harinzu47](https://github.com/harinzu47)
- LinkedIn: [Khalid Jundullah](www.linkedin.com/in/khalid-jundullah-8086b8249)

---

Built with ❤️ using Next.js and TypeScript
