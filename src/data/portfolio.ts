export interface CareerItem {
  role: string;
  company: string;
  year: string;
  summary: string;
}

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  tools: string;
  image: string;
  link?: string;
}

export const portfolioData = {
  firstName: "Amaan",
  lastName: "Syed",
  fullName: "Amaan Syed",
  initials: "AS",
  rolePrefix: "A Software",
  rolePrimary: "Developer",
  roleSecondary: "Engineer",
  email: "Amaansyed284@gmail.com",
  education:
    "Masters of Science(Informatio Technology) - University of Northcarolina at Charlotte",
  about:
    "Full Stack Developer focused on building fast, reliable, and user-friendly web applications. I enjoy working across frontend and backend, and turning product ideas into polished experiences.",
  resumeUrl: "#",
  seoTitle: "Amaan Syed - Software Developer",
  footerText: "Designed and Developed",
  footerYear: "2026",
  socials: {
    github: "https://github.com/AmaanSyed09",
    linkedin: "https://www.linkedin.com/in/amaan-syed-247416166/",
    twitter: "https://x.com/",
    instagram: "https://www.instagram.com/",
  },
  career: [
    {
      role: "Frontend Developer",
      company: "Your Company",
      year: "2022",
      summary:
        "Built responsive interfaces with React and TypeScript, and collaborated with designers to ship production-ready experiences.",
    },
    {
      role: "Full Stack Developer",
      company: "Your Company",
      year: "2024",
      summary:
        "Delivered end-to-end features using modern frontend frameworks, Node.js APIs, and cloud-hosted databases.",
    },
    {
      role: "Software Engineer",
      company: "Current Role",
      year: "NOW",
      summary:
        "Leading feature development, improving performance, and building reusable systems that scale across multiple products.",
    },
  ] as CareerItem[],
  projects: [
    {
      title: "Car Community Event Platform",
      category: "Event Management Web App",
      description:
        "An Express + MongoDB MVC platform for creating car events, managing attendees, and handling RSVP status with host-only controls.",
      tools:
        "Node.js, Express.js, MongoDB, Mongoose, EJS, Express Session, Multer, Express Validator, Rate Limiting",
      image: "/images/Solidx.png",
      link: "#",
    },
    {
      title: "Tic_Tac_Toe Game",
      category: "E-Commerce",
      description:
        "A polished game experience with responsive gameplay, score tracking, and smooth interaction states.",
      tools: "Next.js, API Integration, Stripe",
      image: "/images/radix.png",
      link: "#",
    },
    {
      title: "Portfolio Website",
      category: "Dashboard",
      description:
        "A personal portfolio showcasing projects, skills, and contact pathways with clean UI and animations.",
      tools: "React, Charts, Auth",
      image: "/images/bond.png",
      link: "#",
    },
  ] as ProjectItem[],
};
