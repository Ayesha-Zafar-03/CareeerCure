export interface MockJob {
  id: number;
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  location?: string;
  duration?: string;
  salary_range?: string;
  remote_option?: string;
  job_type?: string;
  required_skills?: string[];
  skills_have?: string[];
  skills_missing?: string[];
  application_url?: string;
  match_score?: number;
}

export interface MockCourse {
  id: number;
  title: string;
  provider: string;
  instructor?: string;
  description: string;
  difficulty_level?: string;
  duration?: string;
  price?: string;
  course_url: string;
  rating?: number;
  category?: string;
  skills_gained?: string[];
  match_score?: number;
  is_free?: boolean;
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: 1,
    title: "Software Engineering Intern",
    company: "Google",
    description: "Join our team to build scalable systems and learn from world-class engineers.",
    location: "Karachi, Pakistan",
    duration: "3 months",
    salary_range: "$5,000/mo",
    remote_option: "hybrid",
    job_type: "internship",
    required_skills: ["Python", "Java", "Algorithms", "Git"],
    skills_have: ["Python", "Git", "Algorithms"],
    skills_missing: ["Java"],
    application_url: "https://careers.google.com",
    match_score: 0.92,
  },
  {
    id: 2,
    title: "Data Science Intern",
    company: "Meta",
    description: "Work on ML models and data pipelines for product insights.",
    location: "Remote",
    duration: "6 months",
    salary_range: "$4,800/mo",
    remote_option: "remote",
    job_type: "internship",
    required_skills: ["Python", "SQL", "Machine Learning", "Statistics"],
    skills_have: ["Python", "SQL"],
    skills_missing: ["Machine Learning", "Statistics"],
    application_url: "https://metacareers.com",
    match_score: 0.78,
  },
  {
    id: 3,
    title: "Junior Frontend Developer",
    company: "Stripe",
    description: "Build beautiful payment experiences with React and TypeScript.",
    location: "Lahore, Pakistan",
    duration: "Full-time",
    salary_range: "$85,000–$110,000",
    remote_option: "on-site",
    job_type: "entry-level",
    required_skills: ["React", "TypeScript", "CSS", "JavaScript"],
    skills_have: ["JavaScript", "CSS", "React"],
    skills_missing: ["TypeScript"],
    application_url: "https://stripe.com/jobs",
    match_score: 0.85,
  },
  {
    id: 4,
    title: "Product Design Intern",
    company: "Airbnb",
    description: "Design user-centered experiences for millions of travelers worldwide.",
    location: "Remote",
    duration: "4 months",
    salary_range: "$4,200/mo",
    remote_option: "remote",
    job_type: "internship",
    required_skills: ["Figma", "UI Design", "User Research", "Prototyping"],
    skills_have: ["Figma", "UI Design"],
    skills_missing: ["User Research", "Prototyping"],
    application_url: "https://careers.airbnb.com",
    match_score: 0.71,
  },
  {
    id: 5,
    title: "Backend Engineer (Entry Level)",
    company: "Notion",
    description: "Build APIs and services that power collaborative workspaces.",
    location: "Islamabad, Pakistan",
    duration: "Full-time",
    salary_range: "$90,000–$120,000",
    remote_option: "hybrid",
    job_type: "entry-level",
    required_skills: ["Go", "PostgreSQL", "REST APIs", "Docker"],
    skills_have: ["REST APIs", "PostgreSQL"],
    skills_missing: ["Go", "Docker"],
    application_url: "https://notion.so/careers",
    match_score: 0.68,
  },
  {
    id: 6,
    title: "Cybersecurity Intern",
    company: "CrowdStrike",
    description: "Learn threat detection and security operations in a fast-paced environment.",
    location: "Rawalpindi, Pakistan",
    duration: "3 months",
    salary_range: "$4,500/mo",
    remote_option: "on-site",
    job_type: "internship",
    required_skills: ["Networking", "Linux", "Security", "Python"],
    skills_have: ["Python", "Linux"],
    skills_missing: ["Networking", "Security"],
    application_url: "https://crowdstrike.com/careers",
    match_score: 0.64,
  },
];

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 1,
    title: "Complete Python Bootcamp",
    provider: "Udemy",
    instructor: "Jose Portilla",
    description: "Master Python from scratch — data structures, OOP, and real projects.",
    difficulty_level: "Beginner",
    duration: "22 hours",
    price: "Free",
    is_free: true,
    course_url: "https://udemy.com",
    rating: 4.7,
    category: "Programming",
    skills_gained: ["Python", "OOP", "Data Structures"],
    match_score: 0.95,
  },
  {
    id: 2,
    title: "Machine Learning Specialization",
    provider: "Coursera",
    instructor: "Andrew Ng",
    description: "Build ML models with supervised learning, neural networks, and deployment.",
    difficulty_level: "Intermediate",
    duration: "3 months",
    price: "$49/month",
    is_free: false,
    course_url: "https://coursera.org",
    rating: 4.9,
    category: "Data Science",
    skills_gained: ["Machine Learning", "TensorFlow", "Statistics"],
    match_score: 0.88,
  },
  {
    id: 3,
    title: "React — The Complete Guide",
    provider: "Udemy",
    instructor: "Maximilian Schwarzmüller",
    description: "Hooks, Redux, Next.js, and modern React patterns for production apps.",
    difficulty_level: "Intermediate",
    duration: "48 hours",
    price: "$19.99",
    is_free: false,
    course_url: "https://udemy.com",
    rating: 4.6,
    category: "Web Development",
    skills_gained: ["React", "Redux", "Next.js"],
    match_score: 0.82,
  },
  {
    id: 4,
    title: "SQL for Data Analysis",
    provider: "DataCamp",
    instructor: "DataCamp Team",
    description: "Query databases, aggregate data, and write efficient SQL for analytics.",
    difficulty_level: "Beginner",
    duration: "6 hours",
    price: "Free",
    is_free: true,
    course_url: "https://datacamp.com",
    rating: 4.5,
    category: "Data Science",
    skills_gained: ["SQL", "PostgreSQL", "Analytics"],
    match_score: 0.79,
  },
  {
    id: 5,
    title: "AWS Cloud Practitioner",
    provider: "AWS",
    instructor: "Amazon Web Services",
    description: "Cloud fundamentals, EC2, S3, and core AWS services for beginners.",
    difficulty_level: "Beginner",
    duration: "10 hours",
    price: "Free",
    is_free: true,
    course_url: "https://aws.amazon.com/training",
    rating: 4.4,
    category: "Cloud",
    skills_gained: ["AWS", "Cloud", "DevOps"],
    match_score: 0.72,
  },
  {
    id: 6,
    title: "Advanced System Design",
    provider: "Educative",
    instructor: "Educative Team",
    description: "Design scalable distributed systems — load balancing, caching, and more.",
    difficulty_level: "Advanced",
    duration: "15 hours",
    price: "$39/month",
    is_free: false,
    course_url: "https://educative.io",
    rating: 4.8,
    category: "Software Engineering",
    skills_gained: ["System Design", "Architecture", "Scalability"],
    match_score: 0.65,
  },
  {
    id: 7,
    title: "UI/UX Design Fundamentals",
    provider: "Google",
    instructor: "Google Career Certificates",
    description: "Learn design thinking, wireframing, and prototyping with Figma.",
    difficulty_level: "Beginner",
    duration: "4 weeks",
    price: "Free",
    is_free: true,
    course_url: "https://grow.google",
    rating: 4.6,
    category: "Design",
    skills_gained: ["Figma", "UI Design", "Prototyping"],
    match_score: 0.70,
  },
  {
    id: 8,
    title: "Docker & Kubernetes",
    provider: "Pluralsight",
    instructor: "Nigel Poulton",
    description: "Containerize apps and orchestrate with Kubernetes in production.",
    difficulty_level: "Advanced",
    duration: "12 hours",
    price: "$29/month",
    is_free: false,
    course_url: "https://pluralsight.com",
    rating: 4.7,
    category: "DevOps",
    skills_gained: ["Docker", "Kubernetes", "CI/CD"],
    match_score: 0.58,
  },
];

export interface MockConversation {
  id: string;
  title: string;
  group: "Today" | "Yesterday" | "Last 7 days";
  preview: string;
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: "1", title: "CV feedback for SWE role", group: "Today", preview: "How can I improve my resume?" },
  { id: "2", title: "Interview prep tips", group: "Today", preview: "What should I practice?" },
  { id: "3", title: "Course recommendations", group: "Yesterday", preview: "Best Python courses?" },
  { id: "4", title: "Career path guidance", group: "Yesterday", preview: "Data science vs SWE?" },
  { id: "5", title: "Internship applications", group: "Last 7 days", preview: "When to apply?" },
];
