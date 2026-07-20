--
-- PostgreSQL database dump
--

\restrict CbKe9cec6dWqMg2aUIWlCWlgyox17OeyC6zgmlvK8GrjeI40Yab5Oh5JLsPlzVD

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: career_paths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.career_paths (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    required_skills json,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: career_paths_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.career_paths_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: career_paths_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.career_paths_id_seq OWNED BY public.career_paths.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    show_jobs boolean,
    show_courses boolean,
    jobs text,
    courses text,
    sequence integer,
    created_at timestamp with time zone DEFAULT now(),
    conversation_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    instructor character varying(255),
    description text NOT NULL,
    required_skills json,
    skills_gained json,
    difficulty_level character varying(50),
    duration character varying(100),
    price character varying(50),
    course_url character varying(500) NOT NULL,
    rating double precision,
    category character varying(100),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: internships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internships (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    description text NOT NULL,
    required_skills json,
    location character varying(255),
    duration character varying(100),
    application_url character varying(500),
    salary_range character varying(100),
    remote_option character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: internships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.internships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: internships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.internships_id_seq OWNED BY public.internships.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    code character varying(6) NOT NULL,
    purpose character varying(50) NOT NULL,
    used boolean,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: planned_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planned_courses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(500) NOT NULL,
    provider character varying(255),
    course_url text,
    duration character varying(100),
    difficulty_level character varying(100),
    description text,
    roadmap character varying(255),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: planned_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planned_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: planned_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planned_courses_id_seq OWNED BY public.planned_courses.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    bio text,
    skills json,
    education character varying(255),
    experience_years integer,
    career_goal character varying(255),
    cv_text text,
    cv_filename character varying(255),
    cv_analysis json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: roadmaps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmaps (
    id integer NOT NULL,
    user_id integer NOT NULL,
    career_goal character varying(255) NOT NULL,
    roadmap_data json NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: roadmaps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roadmaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roadmaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roadmaps_id_seq OWNED BY public.roadmaps.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    hashed_password character varying(255),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    is_verified boolean DEFAULT false,
    oauth_provider character varying(50),
    oauth_id character varying(255),
    is_admin boolean DEFAULT false
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: career_paths id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths ALTER COLUMN id SET DEFAULT nextval('public.career_paths_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: internships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internships ALTER COLUMN id SET DEFAULT nextval('public.internships_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: planned_courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_courses ALTER COLUMN id SET DEFAULT nextval('public.planned_courses_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: roadmaps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmaps ALTER COLUMN id SET DEFAULT nextval('public.roadmaps_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: career_paths; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.career_paths (id, title, description, required_skills, created_at) FROM stdin;
1	Data Scientist	Analyse data and build ML models to drive business decisions.	["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "Scikit-learn"]	2026-06-08 00:54:05.411923+05
2	Machine Learning Engineer	Design and deploy ML systems at scale.	["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Cloud"]	2026-06-08 00:54:05.411923+05
3	Backend Developer	Build robust server-side APIs and services.	["Python", "FastAPI", "Django", "PostgreSQL", "REST APIs", "Docker"]	2026-06-08 00:54:05.411923+05
4	Frontend Developer	Create responsive and accessible web UIs.	["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "HTML/CSS"]	2026-06-08 00:54:05.411923+05
5	Full Stack Developer	Work across the entire web stack.	["JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs", "Git"]	2026-06-08 00:54:05.411923+05
6	DevOps Engineer	Automate infrastructure and CI/CD pipelines.	["Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Terraform"]	2026-06-08 00:54:05.411923+05
7	Cloud Engineer	Design and manage cloud infrastructure.	["AWS", "Azure", "GCP", "Terraform", "Docker", "Networking"]	2026-06-08 00:54:05.411923+05
8	Cybersecurity Analyst	Protect systems and data from threats.	["Network Security", "Penetration Testing", "SIEM", "Linux", "Python", "Cryptography"]	2026-06-08 00:54:05.411923+05
9	Mobile Developer (Android)	Build native Android applications.	["Kotlin", "Java", "Android SDK", "Jetpack Compose", "REST APIs", "Git"]	2026-06-08 00:54:05.411923+05
10	Mobile Developer (iOS)	Build native iOS applications.	["Swift", "SwiftUI", "Xcode", "REST APIs", "Core Data", "Git"]	2026-06-08 00:54:05.411923+05
11	UI/UX Designer	Design intuitive and beautiful user experiences.	["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility"]	2026-06-08 00:54:05.411923+05
12	Data Engineer	Build data pipelines and warehouses.	["Python", "Apache Spark", "Airflow", "SQL", "AWS", "ETL"]	2026-06-08 00:54:05.411923+05
13	Business Intelligence Analyst	Turn data into actionable business insights.	["SQL", "Power BI", "Tableau", "Excel", "Python", "Data Visualisation"]	2026-06-08 00:54:05.411923+05
14	AI/NLP Engineer	Build natural language processing systems.	["Python", "NLP", "Transformers", "HuggingFace", "PyTorch", "LLMs"]	2026-06-08 00:54:05.411923+05
15	Blockchain Developer	Build decentralised applications and smart contracts.	["Solidity", "Ethereum", "Web3.js", "JavaScript", "Cryptography", "Smart Contracts"]	2026-06-08 00:54:05.411923+05
16	Game Developer	Design and build interactive games.	["Unity", "C#", "Unreal Engine", "C++", "3D Modelling", "Game Design"]	2026-06-08 00:54:05.411923+05
17	Embedded Systems Engineer	Program microcontrollers and hardware systems.	["C", "C++", "RTOS", "Arduino", "Raspberry Pi", "Electronics"]	2026-06-08 00:54:05.411923+05
18	QA Engineer	Ensure software quality through testing.	["Selenium", "Pytest", "Postman", "Test Automation", "JIRA", "CI/CD"]	2026-06-08 00:54:05.411923+05
19	Product Manager (Tech)	Lead product strategy and roadmap.	["Product Strategy", "Agile", "JIRA", "Data Analysis", "Communication", "User Research"]	2026-06-08 00:54:05.411923+05
20	Site Reliability Engineer	Maintain reliability and performance of production systems.	["Linux", "Python", "Kubernetes", "Monitoring", "Incident Response", "Cloud"]	2026-06-08 00:54:05.411923+05
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, user_id, role, content, show_jobs, show_courses, jobs, courses, sequence, created_at, conversation_id) FROM stdin;
1	8	user	What skills do I need for backend development?	f	f	\N	\N	0	2026-07-19 13:34:27.984601+05	default
2	8	assistant	For backend development, focus on learning:\n\n* Programming languages: Java, Python, C#, or JavaScript (Node.js)\n* Databases: SQL, NoSQL (e.g., MongoDB), or database frameworks (e.g., Hibernate)\n* Frameworks: Spring (Java), Django (Python), or ASP.NET (C#)\n* Operating Systems: Familiarity with Linux or Windows\n\n**Recommended courses:**\n\n1. **Java Programming Masterclass** (Udemy)\n2. **Python for Data Science and Machine Learning** (Coursera)\n3. **C# Fundamentals** (Microsoft Learn)\n\n**Explore job opportunities:**\n\n1. **Backend Developer**, XYZ Corporation (Remote)\n2. **Junior Java Developer**, ABC Startup (Full-time)\n3. **Python Developer**, DEF Tech Firm (Full-time)	f	t	\N	[{"id": 1, "title": "Complete Python Developer Bootcamp", "provider": "Udemy", "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.", "duration": "60 hours", "difficulty_level": "Beginner", "rating": 4.7, "is_free": false, "price": "$84.99", "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"], "course_url": "https://www.udemy.com/course/100-days-of-code/", "category": "Programming"}, {"id": 2, "title": "Machine Learning Specialization", "provider": "Coursera", "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.", "duration": "3 months", "difficulty_level": "Intermediate", "rating": 4.9, "is_free": true, "price": "Free (certificate $49/month)", "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"], "course_url": "https://www.coursera.org/specializations/machine-learning-introduction", "category": "AI/ML"}, {"id": 3, "title": "The Complete React Developer Course", "provider": "Udemy", "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.", "duration": "40 hours", "difficulty_level": "Intermediate", "rating": 4.6, "is_free": false, "price": "$89.99", "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"], "course_url": "https://www.udemy.com/course/react-2nd-edition/", "category": "Frontend Development"}, {"id": 4, "title": "AWS Cloud Practitioner Essentials", "provider": "Coursera", "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.", "duration": "6 weeks", "difficulty_level": "Beginner", "rating": 4.6, "is_free": true, "price": "Free (certificate $49)", "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"], "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "category": "Cloud Computing"}]	1	2026-07-19 13:34:27.984601+05	default
9	8	user	What skills do I need for backend development?	f	f	\N	\N	2	2026-07-19 15:15:53.825188+05	default
10	8	assistant	As a backend developer, you'll need skills in:\n\n* Programming languages: Java, Python, Ruby, or PHP\n* Databases: MySQL, MongoDB, or PostgreSQL\n* Frameworks: Spring, Django, or Ruby on Rails\n* Operating Systems: Linux or Windows\n\nHere are some courses to help you get started:\n\n* **Java Programming Course** by Udemy ($10.99): Learn Java basics and advanced concepts\n* **Python for Everybody** by Coursera (Free): Master Python programming fundamentals\n* **Database Systems** by edX (Free): Understand database design and management\n* **Spring Framework Tutorial** by Pluralsight ($29/month): Learn Spring framework basics\n\nRecommended jobs:\n- **Backend Software Engineer** at Google ($125,000/year)\n- **Cloud Developer** at Microsoft ($114,000/year)\n- **Full Stack Developer** at Amazon ($105,000/year)\n\nWould you like to know more about the skills or courses?	f	t	\N	[{"id": 1, "title": "Complete Python Developer Bootcamp", "provider": "Udemy", "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.", "duration": "60 hours", "difficulty_level": "Beginner", "rating": 4.7, "is_free": false, "price": "$84.99", "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"], "course_url": "https://www.udemy.com/course/100-days-of-code/", "category": "Programming"}, {"id": 2, "title": "Machine Learning Specialization", "provider": "Coursera", "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.", "duration": "3 months", "difficulty_level": "Intermediate", "rating": 4.9, "is_free": true, "price": "Free (certificate $49/month)", "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"], "course_url": "https://www.coursera.org/specializations/machine-learning-introduction", "category": "AI/ML"}, {"id": 3, "title": "The Complete React Developer Course", "provider": "Udemy", "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.", "duration": "40 hours", "difficulty_level": "Intermediate", "rating": 4.6, "is_free": false, "price": "$89.99", "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"], "course_url": "https://www.udemy.com/course/react-2nd-edition/", "category": "Frontend Development"}, {"id": 4, "title": "AWS Cloud Practitioner Essentials", "provider": "Coursera", "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.", "duration": "6 weeks", "difficulty_level": "Beginner", "rating": 4.6, "is_free": true, "price": "Free (certificate $49)", "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"], "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "category": "Cloud Computing"}]	3	2026-07-19 15:15:53.825188+05	default
11	8	user	What skills do I need for backend development?	f	f	\N	\N	0	2026-07-19 15:16:09.272205+05	conv_qa_75384
12	8	assistant	As a backend developer, you'll need skills in:\n\n* Programming languages: Java, Python, or C#\n* Databases: MySQL, MongoDB, or PostgreSQL\n* Frameworks: Spring, Django, or .NET\n* APIs: RESTful API design and development\n* Operating systems: Linux or Windows\n\nLet's get you started with some courses:\n\n**Backend Development Courses:**\n\n1. **Java for Beginners** by Udemy (4.5/5) - Learn the basics of Java programming.\n2. **Python for Data Science** by DataCamp (4.8/5) - Master Python for data science and backend development.\n3. **Spring Framework** by Pluralsight (4.5/5) - Learn the Spring Framework for Java backend development.\n\n**Recommended Job Opportunities:**\n\n1. **Backend Developer** at Amazon (Remote) - Develop scalable and efficient backend systems.\n2. **Full Stack Developer** at Microsoft (Hybrid) - Build end-to-end solutions with Python, Java, or .NET.\n3. **Cloud Engineer** at Google (Remote) - Design and develop cloud-based backend systems.\n\nLet me know when you're ready to progress!	f	t	\N	[{"id": 1, "title": "Complete Python Developer Bootcamp", "provider": "Udemy", "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.", "duration": "60 hours", "difficulty_level": "Beginner", "rating": 4.7, "is_free": false, "price": "$84.99", "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"], "course_url": "https://www.udemy.com/course/100-days-of-code/", "category": "Programming"}, {"id": 2, "title": "Machine Learning Specialization", "provider": "Coursera", "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.", "duration": "3 months", "difficulty_level": "Intermediate", "rating": 4.9, "is_free": true, "price": "Free (certificate $49/month)", "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"], "course_url": "https://www.coursera.org/specializations/machine-learning-introduction", "category": "AI/ML"}, {"id": 3, "title": "The Complete React Developer Course", "provider": "Udemy", "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.", "duration": "40 hours", "difficulty_level": "Intermediate", "rating": 4.6, "is_free": false, "price": "$89.99", "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"], "course_url": "https://www.udemy.com/course/react-2nd-edition/", "category": "Frontend Development"}, {"id": 4, "title": "AWS Cloud Practitioner Essentials", "provider": "Coursera", "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.", "duration": "6 weeks", "difficulty_level": "Beginner", "rating": 4.6, "is_free": true, "price": "Free (certificate $49)", "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"], "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "category": "Cloud Computing"}]	1	2026-07-19 15:16:09.272205+05	conv_qa_75384
27	16	user	Tell me about the Machine Learning Intern position at AI Solutions Ltd and how I can improve my match.	f	f	\N	\N	0	2026-07-20 09:48:12.727396+05	mrsqusg4hatuuo
29	16	user	jobs	f	f	\N	\N	0	2026-07-20 09:48:56.489359+05	default
30	16	assistant	As a data science enthusiast with Python skills, you can explore these entry-level positions:\n\n* **Data Analyst**: Assist in data visualization, statistical analysis, and report creation. \n* **Junior Data Scientist**: Work on data mining, machine learning, and predictive modeling tasks.\n* **Business Intelligence Developer**: Design and implement data visualization tools and dashboards.\n\nHere are some job opportunities:\n\n **Data Analyst** at IBM ($73,000/year) - [Apply Now](https://www.jobsthatcare.com/data-analyst-ibm-ny)\n **Junior Data Scientist** at Google ($120,000/year) - [Apply Now](https://www.jobsthatcare.com/junior-data-scientist-google-ca)\n **Business Intelligence Developer** at Microsoft ($105,000/year) - [Apply Now](https://www.jobsthatcare.com/business-intelligence-developer-microsoft-wa)\n\nCheck the job links for more details and application instructions!	t	f	[{"id": 40, "title": "E2E Test Intern", "company": "Test Corp", "location": "Remote", "description": "A test job for E2E testing", "skills_required": [], "remote_option": "Remote", "application_url": "#", "salary_range": null, "match_score": 0.85}, {"id": 44, "title": "AI INTERN", "company": "UMT", "location": "", "description": "UMT LAHORE", "skills_required": [], "remote_option": "On-site", "application_url": "#", "salary_range": "", "match_score": 0.85}, {"id": 2, "title": "Backend Developer Intern", "company": "StartupHub", "location": "Lahore, Pakistan", "description": "Build REST APIs using FastAPI and PostgreSQL. Work in an agile team on a SaaS product.", "skills_required": ["Python", "FastAPI", "PostgreSQL", "Git"], "remote_option": "On-site", "application_url": "https://www.rozee.pk/job/jsearch/q/backend-developer-intern", "salary_range": "", "match_score": 0.85}, {"id": 16, "title": "Community Manager", "company": "", "location": "Cary, NC", "description": "", "skills_required": [], "remote_option": "On-site", "application_url": "https://www.rozee.pk/job/jsearch/q/community-manager", "salary_range": "", "match_score": 0.85}, {"id": 1, "title": "Data Science Intern", "company": "TechCorp", "location": "Karachi, Pakistan", "description": "Work on real-world ML projects using Python and scikit-learn. Analyse large datasets and build predictive models.", "skills_required": ["Python", "Machine Learning", "Pandas", "SQL"], "remote_option": "Hybrid", "application_url": "https://www.rozee.pk/job/jsearch/q/data-science-intern", "salary_range": "", "match_score": 0.85}, {"id": 3, "title": "Frontend Developer Intern", "company": "DigitalAgency", "location": "Islamabad, Pakistan", "description": "Develop responsive web interfaces using React and Tailwind CSS. Collaborate with designers.", "skills_required": ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"], "remote_option": "Hybrid", "application_url": "https://www.rozee.pk/job/jsearch/q/frontend-developer-intern", "salary_range": "", "match_score": 0.85}]	\N	1	2026-07-20 09:48:56.489359+05	default
28	16	assistant	Machine Learning Intern at AI Solutions Ltd requires Python skills, which you already have. To improve your match, consider learning:\n\n* Familiarity with deep learning frameworks like TensorFlow or PyTorch\n* Knowledge of data preprocessing and visualization\n* Experience with popular libraries such as NumPy, pandas, and scikit-learn\n\nThis will increase your chances of success in the role.\n\n**Available Job Opportunities:**\n\n1. **Machine Learning Engineer at AI Solutions Ltd**: AI Solutions Ltd is seeking a Machine Learning Engineer to develop and deploy AI models using Python.\n2. **AI/ML Intern at IBM**: IBM is looking for an AI/ML Intern to work on developing intelligent systems using Python and deep learning frameworks.\n3. **Junior Data Scientist at Google**: Google is seeking a Junior Data Scientist to work on developing data-driven solutions using Python and popular libraries.\n\n**Available Course Recommendations:**\n\n1. **Deep Learning with Python**: Learn about deep learning using Python and popular libraries like TensorFlow.\n2. **Data Science with Python**: Get hands-on experience with data science using Python and popular libraries like NumPy, pandas, and scikit-learn.\n3. **Python for Data Science**: Learn the basics of Python for data science, including data preprocessing, visualization, and machine learning.\n\nDo you want to know more about the Machine Learning Intern position or the course recommendations?	t	t	[{"id": 40, "title": "E2E Test Intern", "company": "Test Corp", "location": "Remote", "description": "A test job for E2E testing", "skills_required": [], "remote_option": "Remote", "application_url": "#", "salary_range": null, "match_score": 0.85}, {"id": 44, "title": "AI INTERN", "company": "UMT", "location": "", "description": "UMT LAHORE", "skills_required": [], "remote_option": "On-site", "application_url": "#", "salary_range": "", "match_score": 0.85}, {"id": 2, "title": "Backend Developer Intern", "company": "StartupHub", "location": "Lahore, Pakistan", "description": "Build REST APIs using FastAPI and PostgreSQL. Work in an agile team on a SaaS product.", "skills_required": ["Python", "FastAPI", "PostgreSQL", "Git"], "remote_option": "On-site", "application_url": "https://www.rozee.pk/job/jsearch/q/backend-developer-intern", "salary_range": "", "match_score": 0.85}, {"id": 16, "title": "Community Manager", "company": "", "location": "Cary, NC", "description": "", "skills_required": [], "remote_option": "On-site", "application_url": "https://www.rozee.pk/job/jsearch/q/community-manager", "salary_range": "", "match_score": 0.85}, {"id": 1, "title": "Data Science Intern", "company": "TechCorp", "location": "Karachi, Pakistan", "description": "Work on real-world ML projects using Python and scikit-learn. Analyse large datasets and build predictive models.", "skills_required": ["Python", "Machine Learning", "Pandas", "SQL"], "remote_option": "Hybrid", "application_url": "https://www.rozee.pk/job/jsearch/q/data-science-intern", "salary_range": "", "match_score": 0.85}, {"id": 3, "title": "Frontend Developer Intern", "company": "DigitalAgency", "location": "Islamabad, Pakistan", "description": "Develop responsive web interfaces using React and Tailwind CSS. Collaborate with designers.", "skills_required": ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"], "remote_option": "Hybrid", "application_url": "https://www.rozee.pk/job/jsearch/q/frontend-developer-intern", "salary_range": "", "match_score": 0.85}]	[{"id": 1, "title": "Complete Python Developer Bootcamp", "provider": "Udemy", "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.", "duration": "60 hours", "difficulty_level": "Beginner", "rating": 4.7, "is_free": false, "price": "$84.99", "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"], "course_url": "https://www.udemy.com/course/100-days-of-code/", "category": "Programming"}, {"id": 2, "title": "Machine Learning Specialization", "provider": "Coursera", "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.", "duration": "3 months", "difficulty_level": "Intermediate", "rating": 4.9, "is_free": true, "price": "Free (certificate $49/month)", "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"], "course_url": "https://www.coursera.org/specializations/machine-learning-introduction", "category": "AI/ML"}, {"id": 3, "title": "The Complete React Developer Course", "provider": "Udemy", "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.", "duration": "40 hours", "difficulty_level": "Intermediate", "rating": 4.6, "is_free": false, "price": "$89.99", "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"], "course_url": "https://www.udemy.com/course/react-2nd-edition/", "category": "Frontend Development"}, {"id": 4, "title": "AWS Cloud Practitioner Essentials", "provider": "Coursera", "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.", "duration": "6 weeks", "difficulty_level": "Beginner", "rating": 4.6, "is_free": true, "price": "Free (certificate $49)", "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"], "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "category": "Cloud Computing"}]	1	2026-07-20 09:48:12.727396+05	mrsqusg4hatuuo
31	16	user	Recommend courses for my career goal	f	f	\N	\N	0	2026-07-20 09:49:08.619292+05	mrsqvzlf9qivzw
32	16	assistant	To achieve your Data Science goal, focus on developing skills in machine learning, statistics, and data visualization. Consider taking courses in:\n\n* **Python for Data Science**: Understand advanced libraries like Pandas, NumPy, and Matplotlib.\n* **Machine Learning**: Study supervised and unsupervised learning with scikit-learn and TensorFlow.\n* **Data Visualization**: Learn to create interactive and informative dashboards with Plotly, Tableau, or Power BI.\n\nRecommended courses:\n1. **Python for Data Science** on DataCamp\n2. **Machine Learning with Python** on Coursera\n3. **Data Visualization with Python** on edX\n\nCheck out these resources to start building your Data Science skills:	f	t	\N	[{"id": 1, "title": "Complete Python Developer Bootcamp", "provider": "Udemy", "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.", "duration": "60 hours", "difficulty_level": "Beginner", "rating": 4.7, "is_free": false, "price": "$84.99", "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"], "course_url": "https://www.udemy.com/course/100-days-of-code/", "category": "Programming"}, {"id": 2, "title": "Machine Learning Specialization", "provider": "Coursera", "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.", "duration": "3 months", "difficulty_level": "Intermediate", "rating": 4.9, "is_free": true, "price": "Free (certificate $49/month)", "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"], "course_url": "https://www.coursera.org/specializations/machine-learning-introduction", "category": "AI/ML"}, {"id": 3, "title": "The Complete React Developer Course", "provider": "Udemy", "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.", "duration": "40 hours", "difficulty_level": "Intermediate", "rating": 4.6, "is_free": false, "price": "$89.99", "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"], "course_url": "https://www.udemy.com/course/react-2nd-edition/", "category": "Frontend Development"}, {"id": 4, "title": "AWS Cloud Practitioner Essentials", "provider": "Coursera", "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.", "duration": "6 weeks", "difficulty_level": "Beginner", "rating": 4.6, "is_free": true, "price": "Free (certificate $49)", "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"], "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "category": "Cloud Computing"}]	1	2026-07-20 09:49:08.619292+05	mrsqvzlf9qivzw
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, title, provider, instructor, description, required_skills, skills_gained, difficulty_level, duration, price, course_url, rating, category, created_at) FROM stdin;
1	Complete Python Developer Bootcamp	Udemy	Dr. Angela Yu	Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.	[]	["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"]	Beginner	60 hours	$84.99	https://www.udemy.com/course/100-days-of-code/	4.7	Programming	2026-06-08 00:54:05.451131+05
2	Machine Learning Specialization	Coursera	Andrew Ng	Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.	["Python", "Basic Mathematics"]	["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"]	Intermediate	3 months	Free (certificate $49/month)	https://www.coursera.org/specializations/machine-learning-introduction	4.9	AI/ML	2026-06-08 00:54:05.451131+05
3	The Complete React Developer Course	Udemy	Andrew Mead	Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.	["JavaScript", "HTML", "CSS"]	["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"]	Intermediate	40 hours	$89.99	https://www.udemy.com/course/react-2nd-edition/	4.6	Frontend Development	2026-06-08 00:54:05.451131+05
4	AWS Cloud Practitioner Essentials	Coursera	AWS Training	Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.	["Basic IT knowledge"]	["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"]	Beginner	6 weeks	Free (certificate $49)	https://www.coursera.org/learn/aws-cloud-practitioner-essentials	4.6	Cloud Computing	2026-06-08 00:54:05.451131+05
5	Data Science and Machine Learning Bootcamp	Udemy	Jose Portilla	Learn to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more for data science.	["Python basics"]	["Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-Learn", "Data Analysis"]	Intermediate	25 hours	$94.99	https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/	4.6	Data Science	2026-06-08 00:54:05.451131+05
6	CS50's Introduction to Computer Science	edX	David J. Malan	Harvard's introduction to computer science and programming. Learn C, Python, SQL, JavaScript, CSS, and HTML. Build real projects.	[]	["C", "Python", "JavaScript", "SQL", "HTML/CSS", "Algorithms"]	Beginner	12 weeks	Free (certificate $149)	https://www.edx.org/course/introduction-computer-science-harvardx-cs50x	4.8	Computer Science	2026-06-08 00:54:05.451131+05
7	Docker and Kubernetes Complete Course	Udemy	Mumshad Mannambeth	Master Docker and Kubernetes from basics to advanced. Learn containerization, orchestration, and deployment in production environments.	["Linux basics", "Command line"]	["Docker", "Kubernetes", "Containerization", "Microservices", "DevOps"]	Intermediate	13 hours	$89.99	https://www.udemy.com/course/learn-docker/	4.7	DevOps	2026-06-08 00:54:05.451131+05
8	Complete SQL Bootcamp	Udemy	Jose Portilla	Learn SQL quickly and effectively with PostgreSQL. Master database queries, joins, functions, and advanced SQL concepts.	[]	["SQL", "PostgreSQL", "Database Design", "Joins", "Functions", "Views"]	Beginner	9 hours	$84.99	https://www.udemy.com/course/the-complete-sql-bootcamp/	4.7	Database	2026-06-08 00:54:05.451131+05
9	Deep Learning Specialization	Coursera	Andrew Ng	Build and apply deep neural networks. Learn CNN, RNN, LSTM, Adam, Dropout, BatchNorm, Xavier/He initialization and more.	["Python", "Machine Learning basics"]	["Deep Learning", "Neural Networks", "CNN", "RNN", "TensorFlow", "Keras"]	Advanced	4 months	Free (certificate $49/month)	https://www.coursera.org/specializations/deep-learning	4.8	AI/ML	2026-06-08 00:54:05.451131+05
10	The Complete Node.js Developer Course	Udemy	Andrew Mead	Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more. Build chat apps, weather apps, and task managers.	["JavaScript", "HTML", "CSS"]	["Node.js", "Express.js", "MongoDB", "REST APIs", "Authentication", "Testing"]	Intermediate	35 hours	$89.99	https://www.udemy.com/course/the-complete-nodejs-developer-course-2/	4.7	Backend Development	2026-06-08 00:54:05.451131+05
11	Google UX Design Certificate	Coursera	Google Career Certificates	Learn UX design fundamentals. Conduct user research, create wireframes and prototypes, and build a professional portfolio.	[]	["UX Design", "Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing"]	Beginner	6 months	Free (certificate $49/month)	https://www.coursera.org/professional-certificates/google-ux-design	4.7	Design	2026-06-08 00:54:05.451131+05
12	Flutter & Dart - Complete Development Course	Udemy	Dr. Angela Yu	Build native iOS and Android apps with Flutter. Learn Dart programming, UI design, state management, and app deployment.	["Programming basics"]	["Flutter", "Dart", "Mobile Development", "State Management", "Firebase", "APIs"]	Intermediate	31 hours	$94.99	https://www.udemy.com/course/flutter-bootcamp-with-dart/	4.6	Mobile Development	2026-06-08 00:54:05.451131+05
13	Cybersecurity Fundamentals	edX	IBM	Learn cybersecurity essentials including threat analysis, risk management, and security frameworks. Understand common attacks and defenses.	["Basic IT knowledge"]	["Cybersecurity", "Risk Management", "Network Security", "Incident Response", "Compliance"]	Beginner	8 weeks	Free (certificate $99)	https://www.edx.org/course/cybersecurity-fundamentals	4.5	Cybersecurity	2026-06-08 00:54:05.451131+05
14	Complete Web Developer Bootcamp	Udemy	Dr. Angela Yu	Become a full-stack web developer. Learn HTML, CSS, JavaScript, Node, React, MongoDB, and Web3. Build 16+ projects.	[]	["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Bootstrap"]	Beginner	65 hours	$84.99	https://www.udemy.com/course/the-complete-web-development-bootcamp/	4.7	Web Development	2026-06-08 00:54:05.451131+05
15	Tableau Desktop Specialist Certification	Coursera	Tableau Learning Partner	Master Tableau for data visualization. Learn to create interactive dashboards, charts, and reports. Prepare for Tableau certification.	["Basic data knowledge"]	["Tableau", "Data Visualization", "Dashboard Design", "Business Intelligence", "Analytics"]	Intermediate	4 weeks	Free (certificate $49)	https://www.coursera.org/learn/tableau-desktop-specialist	4.5	Data Science	2026-06-08 00:54:05.451131+05
16	Complete Python Bootcamp From Zero to Hero	Udemy	Jose Portilla	Learn Python programming from basics to advanced concepts with hands-on projects.	[]	["Python", "Object-Oriented Programming", "Data Structures", "File I/O"]	Beginner	22 hours	$84.99	https://www.udemy.com/course/complete-python-bootcamp/	4.6	Programming	2026-07-11 08:31:49.443217+05
17	The Complete JavaScript Course 2024	Udemy	Jonas Schmedtmann	Master modern JavaScript with projects, challenges and real-world applications.	[]	["JavaScript", "ES6+", "DOM Manipulation", "Async JavaScript", "APIs"]	Beginner	69 hours	$94.99	https://www.udemy.com/course/the-complete-javascript-course/	4.7	Web Development	2026-07-11 08:31:49.443217+05
18	React - The Complete Guide	Udemy	Maximilian Schwarzmüller	Learn React.js from scratch including Hooks, Router, Redux and Next.js.	[]	["React", "Redux", "React Hooks", "React Router", "Next.js"]	Intermediate	48 hours	$94.99	https://www.udemy.com/course/react-the-complete-guide-incl-redux/	4.6	Web Development	2026-07-11 08:31:49.443217+05
19	Machine Learning A-Z	Udemy	Kirill Eremenko	Learn to create Machine Learning algorithms in Python and R with real projects.	[]	["Machine Learning", "Python", "R", "Data Analysis", "Statistics"]	Intermediate	44 hours	$84.99	https://www.udemy.com/course/machinelearning/	4.5	Data Science	2026-07-11 08:31:49.443217+05
20	AWS Certified Solutions Architect	Udemy	Stephane Maarek	Complete guide to pass AWS Solutions Architect certification with hands-on labs.	[]	["AWS", "Cloud Architecture", "EC2", "S3", "Solutions Architecture"]	Intermediate	27 hours	$89.99	https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/	4.7	Cloud Computing	2026-07-11 08:31:49.443217+05
21	Complete Python Bootcamp	Udemy	Jose Portilla	Master Python programming	[]	["Python", "OOP", "Data Structures"]	Beginner	22 hours	$84.99	https://www.udemy.com/course/complete-python-bootcamp/	4.6	Programming	2026-07-11 09:06:36.946515+05
22	React Complete Guide	Udemy	Maximilian Schwarzmüller	Master React.js development	[]	["React", "Redux", "Hooks"]	Intermediate	48 hours	$94.99	https://www.udemy.com/course/react-the-complete-guide-incl-redux/	4.6	Web Development	2026-07-11 09:06:36.946515+05
23	AWS Solutions Architect	Udemy	Stephane Maarek	AWS certification prep	[]	["AWS", "Cloud", "Architecture"]	Intermediate	27 hours	$89.99	https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/	4.7	Cloud Computing	2026-07-11 09:06:36.946515+05
24	CS50 Introduction to Computer Science	Harvard (edX)	David Malan	Harvard's intro CS course	[]	["C", "Python", "Algorithms"]	Beginner	12 weeks	Free	https://www.edx.org/course/introduction-computer-science-harvardx-cs50x	4.9	Computer Science	2026-07-11 09:06:36.946515+05
25	Deep Learning Specialization	Coursera (DeepLearning.AI)	Andrew Ng	Master deep learning	[]	["Deep Learning", "Neural Networks", "TensorFlow"]	Advanced	4 months	$49/month	https://www.coursera.org/specializations/deep-learning	4.8	AI	2026-07-11 09:06:36.946515+05
26	Full Stack React	Coursera	Jogesh Muppala	Complete React development	[]	["React", "Node.js", "MongoDB"]	Intermediate	4 months	$39/month	https://www.coursera.org/specializations/full-stack-react	4.6	Web Development	2026-07-11 09:06:36.946515+05
27	Google Data Analytics	Coursera (Google)	Google Team	Professional certificate	[]	["SQL", "Tableau", "R"]	Beginner	6 months	$39/month	https://www.coursera.org/professional-certificates/google-data-analytics	4.7	Data Analytics	2026-07-11 09:06:36.946515+05
28	iOS Development	Udacity	Udacity Team	Build iOS apps	[]	["Swift", "iOS", "Xcode"]	Intermediate	4 months	$399/month	https://www.udacity.com/course/ios-developer-nanodegree--nd003	4.4	Mobile	2026-07-11 09:06:36.946515+05
29	Docker and Kubernetes	Udemy	Stephen Grider	Container orchestration	[]	["Docker", "Kubernetes", "Microservices"]	Intermediate	21 hours	$84.99	https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/	4.6	DevOps	2026-07-11 09:06:36.946515+05
30	Node.js Complete Course	Udemy	Andrew Mead	Backend development	[]	["Node.js", "Express", "MongoDB"]	Intermediate	35 hours	$84.99	https://www.udemy.com/course/the-complete-nodejs-developer-course-2/	4.7	Backend	2026-07-11 09:06:36.946515+05
31	Cybersecurity Specialization	Coursera (UMD)	UMD Faculty	Complete cybersecurity	[]	["Network Security", "Cryptography", "Forensics"]	Intermediate	6 months	$39/month	https://www.coursera.org/specializations/cyber-security	4.5	Security	2026-07-11 09:06:36.946515+05
32	Android Development	Udacity	Google	Build Android apps	[]	["Kotlin", "Android", "SQLite"]	Intermediate	4 months	$399/month	https://www.udacity.com/course/android-kotlin-developer-nanodegree--nd940	4.3	Mobile	2026-07-11 09:06:36.946515+05
33	TensorFlow for AI	Coursera	Laurence Moroney	AI with TensorFlow	[]	["TensorFlow", "Neural Networks", "ML"]	Beginner	4 weeks	$39/month	https://www.coursera.org/learn/introduction-tensorflow/	4.7	AI	2026-07-11 09:06:36.946515+05
34	Web Developer Bootcamp	Udemy	Colt Steele	Complete web development	[]	["HTML", "CSS", "JavaScript", "Node.js"]	Beginner	63 hours	$84.99	https://www.udemy.com/course/the-web-developer-bootcamp/	4.7	Web Development	2026-07-11 09:06:36.946515+05
35	Blockchain Basics	Coursera (Buffalo)	Bina Ramamurthy	Understanding blockchain	[]	["Blockchain", "Cryptocurrency", "Smart Contracts"]	Beginner	4 weeks	$39/month	https://www.coursera.org/learn/blockchain-basics/	4.6	Blockchain	2026-07-11 09:06:36.946515+05
36	Data Structures & Algorithms	Coursera (UCSD)	UCSD Faculty	Master DSA	[]	["Algorithms", "Data Structures", "Problem Solving"]	Intermediate	6 months	$39/month	https://www.coursera.org/specializations/data-structures-algorithms	4.5	Computer Science	2026-07-11 09:06:36.946515+05
37	Unity Game Development	Udemy	GameDev.tv	Build 2D & 3D games	[]	["Unity", "C#", "Game Development"]	Beginner	37 hours	$84.99	https://www.udemy.com/course/unitycourse/	4.6	Game Development	2026-07-11 09:06:36.946515+05
38	Python Data Science	Udemy	Jose Portilla	Data science with Python	[]	["Python", "Pandas", "Scikit-Learn"]	Intermediate	25 hours	$84.99	https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/	4.6	Data Science	2026-07-11 09:06:36.946515+05
39	Advanced React	Frontend Masters	Brian Holt	Advanced React patterns	[]	["React", "Performance", "Hooks"]	Advanced	8 hours	$39/month	https://frontendmasters.com/courses/complete-react-v8/	4.8	Web Development	2026-07-11 09:06:36.946515+05
40	System Design	Educative	Fahim ul Haq	Large-scale system design	[]	["System Design", "Scalability", "Architecture"]	Advanced	20 hours	$59/month	https://www.educative.io/courses/grokking-the-system-design-interview	4.7	System Design	2026-07-11 09:06:36.946515+05
41	Kubernetes for Developers	Pluralsight	Dan Wahlin	K8s fundamentals	[]	["Kubernetes", "Containers", "DevOps"]	Intermediate	6 hours	$29/month	https://www.pluralsight.com/courses/kubernetes-developers-core-concepts	4.6	DevOps	2026-07-11 09:06:36.946515+05
42	Ethical Hacking	Udemy	Zaid Sabih	Learn penetration testing	[]	["Ethical Hacking", "Penetration Testing", "Security"]	Intermediate	15 hours	$89.99	https://www.udemy.com/course/learn-ethical-hacking-from-scratch/	4.5	Security	2026-07-11 09:06:36.946515+05
43	Advanced Python	Real Python	Real Python Team	Advanced Python concepts	[]	["Python", "Advanced Programming", "Design Patterns"]	Advanced	Self-paced	$60/month	https://realpython.com/courses/	4.8	Programming	2026-07-11 09:06:36.946515+05
44	Go Programming	Udemy	Todd McLeod	Master Go language	[]	["Go", "Backend Development", "Concurrency"]	Intermediate	46 hours	$84.99	https://www.udemy.com/course/learn-how-to-code/	4.7	Programming	2026-07-11 09:06:36.946515+05
45	Machine Learning A-Z™: Hands-On Python & R	Udemy	Kirill Eremenko	Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.	[]	["Machine Learning", "Python", "R", "Data Analysis"]	Intermediate	44 hours	$84.99	https://www.udemy.com/course/machinelearning/	4.5	Data Science	2026-07-11 18:51:41.437959+05
47	E2E Test Course	Test Provider	\N	A test course created during E2E testing	[]	[]	Beginner	\N	\N	https://example.com/course	\N	Testing	2026-07-19 20:52:53.900957+05
51	Test1	udemy		test	[]	[]	Beginner			test.com	\N		2026-07-20 09:40:43.105351+05
\.


--
-- Data for Name: internships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.internships (id, title, company, description, required_skills, location, duration, application_url, salary_range, remote_option, created_at) FROM stdin;
40	E2E Test Intern	Test Corp	A test job for E2E testing	[]	Remote	\N	\N	\N	Remote	2026-07-19 20:52:53.933011+05
44	AI INTERN	UMT	UMT LAHORE	[]					On-site	2026-07-20 09:41:04.536882+05
2	Backend Developer Intern	StartupHub	Build REST APIs using FastAPI and PostgreSQL. Work in an agile team on a SaaS product.	["Python", "FastAPI", "PostgreSQL", "Git"]	Lahore, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/backend-developer-intern		On-site	2026-06-08 00:54:05.439378+05
16	Community Manager			[]	Cary, NC	\N	https://www.rozee.pk/job/jsearch/q/community-manager		On-site	2026-07-11 08:41:54.223134+05
1	Data Science Intern	TechCorp	Work on real-world ML projects using Python and scikit-learn. Analyse large datasets and build predictive models.	["Python", "Machine Learning", "Pandas", "SQL"]	Karachi, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/data-science-intern		Hybrid	2026-06-08 00:54:05.439378+05
3	Frontend Developer Intern	DigitalAgency	Develop responsive web interfaces using React and Tailwind CSS. Collaborate with designers.	["React", "JavaScript", "Tailwind CSS", "HTML/CSS"]	Islamabad, Pakistan	2 months	https://www.rozee.pk/job/jsearch/q/frontend-developer-intern		Hybrid	2026-06-08 00:54:05.439378+05
4	Machine Learning Intern	AI Solutions Ltd	Implement and fine-tune deep learning models for computer vision tasks using PyTorch.	["Python", "PyTorch", "Computer Vision", "NumPy"]	Remote	4 months	https://www.linkedin.com/jobs/search/?keywords=Machine+Learning+Intern&f_WT=2		Remote	2026-06-08 00:54:05.439378+05
5	DevOps Intern	CloudBase	Set up CI/CD pipelines, manage Docker containers, and assist with AWS infrastructure.	["Docker", "AWS", "CI/CD", "Linux", "Git"]	Karachi, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/devops-intern		Hybrid	2026-06-08 00:54:05.439378+05
6	Full Stack Intern	WebWorks	Build features across the full stack using Next.js and Node.js. Work on a live e-commerce platform.	["Next.js", "Node.js", "PostgreSQL", "TypeScript"]	Lahore, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/full-stack-intern		Hybrid	2026-06-08 00:54:05.439378+05
9	UI/UX Design Intern	CreativeStudio	Design user flows, wireframes, and high-fidelity prototypes in Figma for mobile and web apps.	["Figma", "Wireframing", "Prototyping", "User Research"]	Remote	2 months	https://www.linkedin.com/jobs/search/?keywords=UI%2FUX+Design+Intern&f_WT=2		Remote	2026-06-08 00:54:05.439378+05
10	Data Engineering Intern	DataFlow Inc	Build ETL pipelines using Apache Airflow and process large datasets on AWS.	["Python", "SQL", "Apache Airflow", "AWS", "ETL"]	Remote	4 months	https://www.linkedin.com/jobs/search/?keywords=Data+Engineering+Intern&f_WT=2		Remote	2026-06-08 00:54:05.439378+05
12	Backend Engineer	Microsoft	Develop scalable backend services using .NET, Azure, and cloud technologies.	["C#", ".NET", "Azure", "SQL", "REST APIs"]	Seattle, WA	\N	https://www.rozee.pk/job/jsearch/q/backend-engineer		Hybrid	2026-07-11 08:31:49.443217+05
20	Machine Learning Engineer	OpenAI	Develop cutting-edge AI models	["Python", "PyTorch", "CUDA"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/machine-learning-engineer		Hybrid	2026-07-11 09:06:36.788207+05
7	Cybersecurity Intern	SecureNet	Assist with vulnerability assessments, penetration testing, and security audits.	["Network Security", "Linux", "Python", "Penetration Testing"]	Islamabad, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/cybersecurity-intern		On-site	2026-06-08 00:54:05.439378+05
8	Mobile App Intern (Android)	AppFactory	Develop Android features using Kotlin and Jetpack Compose for a fintech application.	["Kotlin", "Android SDK", "Jetpack Compose", "REST APIs"]	Karachi, Pakistan	3 months	https://www.rozee.pk/job/jsearch/q/mobile-app-intern-android		On-site	2026-06-08 00:54:05.439378+05
11	Frontend Developer Intern	Google	Join our team to build next-generation web experiences using React, TypeScript, and modern web technologies.	["JavaScript", "React", "TypeScript", "HTML", "CSS"]	Mountain View, CA	\N	https://www.rozee.pk/job/jsearch/q/frontend-developer-intern		Hybrid	2026-07-11 08:31:49.443217+05
13	Full Stack Developer	Meta	Build social platforms that connect billions of people worldwide.	["React", "Python", "GraphQL", "JavaScript", "Node.js"]	Menlo Park, CA	\N	https://www.rozee.pk/job/jsearch/q/full-stack-developer		Hybrid	2026-07-11 08:31:49.443217+05
14	Data Scientist	Amazon	Apply machine learning to solve complex business problems using AWS services.	["Python", "Machine Learning", "SQL", "AWS", "Statistics"]	Seattle, WA	\N	https://www.linkedin.com/jobs/search/?keywords=Data+Scientist&f_WT=2		Remote	2026-07-11 08:31:49.443217+05
15	iOS Developer	Apple	Develop software for Apple's ecosystem including iOS and macOS platforms.	["Swift", "Objective-C", "iOS", "Xcode", "UIKit"]	Cupertino, CA	\N	https://www.rozee.pk/job/jsearch/q/ios-developer		On-site	2026-07-11 08:31:49.443217+05
17	Senior Software Engineer	Microsoft	Build cloud-native applications using Azure and .NET technologies. Work in a collaborative environment.	["C#", ".NET", "Azure", "Kubernetes"]	Redmond, WA	\N	https://www.rozee.pk/job/jsearch/q/senior-software-engineer		Hybrid	2026-07-11 09:06:36.788207+05
18	Frontend Developer	Meta	Create engaging user experiences for billions of users worldwide using React and GraphQL.	["React", "JavaScript", "GraphQL", "CSS"]	Menlo Park, CA	\N	https://www.rozee.pk/job/jsearch/q/frontend-developer		On-site	2026-07-11 09:06:36.788207+05
19	Senior Software Engineer	Stripe	Build financial infrastructure for the internet	["Ruby", "Go", "PostgreSQL"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/senior-software-engineer		Hybrid	2026-07-11 09:06:36.788207+05
21	Cloud Architect	Databricks	Design cloud data platforms	["Spark", "AWS", "Kubernetes"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Cloud+Architect&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
22	DevOps Engineer	GitLab	Build CI/CD infrastructure	["Kubernetes", "GitLab CI", "Terraform"]	Remote	\N	https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
23	Security Engineer	Cloudflare	Protect websites from cyber threats	["Network Security", "Go", "Rust"]	Austin, TX	\N	https://www.rozee.pk/job/jsearch/q/security-engineer		Hybrid	2026-07-11 09:06:36.788207+05
24	Product Manager	Notion	Drive product strategy for productivity tools	["Product Strategy", "Data Analysis", "SQL"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Product+Manager&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
26	Data Engineer	Snowflake	Build data infrastructure	["Python", "Scala", "Spark"]	San Mateo, CA	\N	https://www.rozee.pk/job/jsearch/q/data-engineer		Hybrid	2026-07-11 09:06:36.788207+05
27	Mobile Engineer	Discord	Build mobile gaming platform	["React Native", "Swift", "Kotlin"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Mobile+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
28	Site Reliability Engineer	Datadog	Ensure platform reliability	["Go", "Python", "Kubernetes"]	New York, NY	\N	https://www.rozee.pk/job/jsearch/q/site-reliability-engineer		Hybrid	2026-07-11 09:06:36.788207+05
29	Backend Engineer	Coinbase	Build cryptocurrency infrastructure	["Go", "Python", "PostgreSQL"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Backend+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
30	AI Research Scientist	Anthropic	Research AI safety	["Python", "PyTorch", "RLHF"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/ai-research-scientist		Hybrid	2026-07-11 09:06:36.788207+05
31	Platform Engineer	Vercel	Build edge computing platform	["Node.js", "Next.js", "Serverless"]	Remote	\N	https://www.linkedin.com/jobs/search/?keywords=Platform+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
32	Quantum Engineer	Rigetti	Develop quantum software	["Python", "Quantum Computing", "Physics"]	Berkeley, CA	\N	https://www.rozee.pk/job/jsearch/q/quantum-engineer		On-site	2026-07-11 09:06:36.788207+05
33	Growth Engineer	Plaid	Drive user acquisition	["React", "Python", "A/B Testing"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/growth-engineer		Hybrid	2026-07-11 09:06:36.788207+05
34	Full Stack Engineer	Linear	Build project management tools	["React", "Node.js", "TypeScript"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
35	Infrastructure Engineer	Render	Build cloud platform	["Go", "Kubernetes", "AWS"]	San Francisco, CA	\N	https://www.linkedin.com/jobs/search/?keywords=Infrastructure+Engineer&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
36	Data Scientist	Scale AI	Build AI training data platforms	["Python", "Machine Learning", "SQL"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/data-scientist		Hybrid	2026-07-11 09:06:36.788207+05
37	Software Engineer	Retool	Build internal tool platform	["JavaScript", "React", "Node.js"]	San Francisco, CA	\N	https://www.rozee.pk/job/jsearch/q/software-engineer		Hybrid	2026-07-11 09:06:36.788207+05
38	Security Architect	1Password	Design security infrastructure	["Cryptography", "Go", "Security"]	Toronto, Canada	\N	https://www.linkedin.com/jobs/search/?keywords=Security+Architect&f_WT=2		Remote	2026-07-11 09:06:36.788207+05
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otps (id, email, code, purpose, used, expires_at, created_at) FROM stdin;
1	y0685670@gmail.com	984093	email_verification	t	2026-06-08 01:47:54.468272+05	2026-06-08 01:37:54.473751+05
2	y0685670@gmail.com	016458	email_verification	t	2026-06-08 01:47:58.699259+05	2026-06-08 01:37:58.702825+05
3	y0685670@gmail.com	500623	email_verification	t	2026-06-08 01:52:28.508928+05	2026-06-08 01:42:28.523944+05
4	ayeshaaazafar2004@gmail.com	685784	email_verification	t	2026-06-08 02:00:55.619713+05	2026-06-08 01:50:55.629226+05
6	ayeshaaazafar2004@gmail.com	743589	password_reset	t	2026-06-08 02:02:33.328664+05	2026-06-08 01:52:33.332858+05
5	ayeshaaazafar2004@gmail.com	915653	email_verification	t	2026-06-08 02:01:00.353793+05	2026-06-08 01:51:00.366052+05
7	ayeshaaazafar2004@gmail.com	802616	email_verification	t	2026-06-08 02:04:08.65157+05	2026-06-08 01:54:08.656983+05
8	test@example.com	667147	email_verification	t	2026-07-08 23:29:29.923658+05	2026-07-08 23:19:29.926398+05
9	test@example.com	133025	email_verification	t	2026-07-08 23:34:28.140025+05	2026-07-08 23:24:28.156925+05
10	test@example.com	876213	email_verification	t	2026-07-09 20:11:51.763881+05	2026-07-09 20:01:51.768444+05
11	test@example.com	677660	email_verification	f	2026-07-10 23:47:27.717302+05	2026-07-10 23:37:27.745139+05
12	s2024065013@umt.edu.pk	778015	email_verification	t	2026-07-11 14:07:09.075623+05	2026-07-11 13:57:09.091687+05
13	s2024065013@umt.edu.pk	913442	email_verification	f	2026-07-11 14:08:24.98927+05	2026-07-11 13:58:25.00002+05
14	f2022065212@umt.edu.pk	141011	admin_login	t	2026-07-19 13:05:20.488115+05	2026-07-19 12:55:20.540071+05
15	f2022065212@umt.edu.pk	567876	admin_login	t	2026-07-19 13:06:49.491602+05	2026-07-19 12:56:49.497455+05
16	f2022065212@umt.edu.pk	316701	admin_login	t	2026-07-19 13:07:25.613457+05	2026-07-19 12:57:25.625993+05
17	f2022065212@umt.edu.pk	595157	admin_login	t	2026-07-19 13:08:05.776124+05	2026-07-19 12:58:05.778816+05
18	f2022065212@umt.edu.pk	880658	admin_login	t	2026-07-19 13:14:49.946756+05	2026-07-19 13:04:49.955963+05
19	f2022065212@umt.edu.pk	594117	admin_login	t	2026-07-19 13:15:59.164118+05	2026-07-19 13:05:59.168302+05
20	f2022065212@umt.edu.pk	988692	admin_login	t	2026-07-19 13:16:19.887236+05	2026-07-19 13:06:19.898734+05
21	f2022065212@umt.edu.pk	363271	admin_login	t	2026-07-19 13:17:43.811749+05	2026-07-19 13:07:43.817691+05
22	f2022065212@umt.edu.pk	120121	admin_login	t	2026-07-19 13:34:22.387444+05	2026-07-19 13:24:22.411713+05
23	f2022065212@umt.edu.pk	118754	admin_login	t	2026-07-19 13:44:23.555881+05	2026-07-19 13:34:23.560853+05
24	f2022065212@umt.edu.pk	068577	admin_login	t	2026-07-19 15:01:13.517321+05	2026-07-19 14:51:13.540161+05
25	ayeshaaazafar2004@gmail.com	374864	email_verification	t	2026-07-19 15:05:05.468114+05	2026-07-19 14:55:05.476226+05
26	qatest+8017@test.com	421552	email_verification	t	2026-07-19 15:22:27.338009+05	2026-07-19 15:12:27.342456+05
27	f2022065212@umt.edu.pk	563251	admin_login	t	2026-07-19 15:24:31.444203+05	2026-07-19 15:14:31.458784+05
28	qatchat+19557@test.com	536210	email_verification	t	2026-07-19 15:25:20.277976+05	2026-07-19 15:15:20.282311+05
29	f2022065212@umt.edu.pk	880499	admin_login	t	2026-07-19 15:25:49.468063+05	2026-07-19 15:15:49.469075+05
30	f2022065212@umt.edu.pk	818845	admin_login	t	2026-07-19 15:26:04.624145+05	2026-07-19 15:16:04.630353+05
31	f2022065212@umt.edu.pk	130178	admin_login	t	2026-07-19 20:37:09.135686+05	2026-07-19 20:27:09.151096+05
32	f2022065212@umt.edu.pk	349559	admin_login	t	2026-07-19 20:38:37.782176+05	2026-07-19 20:28:37.875187+05
33	e2etest@test.com	568580	email_verification	f	2026-07-19 21:00:21.245203+05	2026-07-19 20:50:21.251707+05
34	f2022065212@umt.edu.pk	229286	admin_login	t	2026-07-19 21:00:24.699288+05	2026-07-19 20:50:24.711146+05
36	e2e66576@test.com	587511	email_verification	f	2026-07-19 21:01:47.773263+05	2026-07-19 20:51:47.775372+05
35	f2022065212@umt.edu.pk	996410	admin_login	t	2026-07-19 21:00:41.927123+05	2026-07-19 20:50:41.930112+05
38	e2e64755@test.com	218036	email_verification	t	2026-07-19 21:02:44.720089+05	2026-07-19 20:52:44.721418+05
37	f2022065212@umt.edu.pk	070849	admin_login	t	2026-07-19 21:01:50.41611+05	2026-07-19 20:51:50.419703+05
39	f2022065212@umt.edu.pk	753290	admin_login	t	2026-07-19 21:02:51.369564+05	2026-07-19 20:52:51.379424+05
40	f2022065212@umt.edu.pk	771512	admin_login	t	2026-07-19 21:03:05.810704+05	2026-07-19 20:53:05.813447+05
41	f2022065212@umt.edu.pk	065667	admin_login	t	2026-07-19 21:05:59.697968+05	2026-07-19 20:55:59.70345+05
42	f2022065212@umt.edu.pk	833962	admin_login	t	2026-07-19 23:10:31.041445+05	2026-07-19 23:00:31.076871+05
43	f2022065212@umt.edu.pk	137104	admin_login	t	2026-07-20 09:12:19.990828+05	2026-07-20 09:02:20.019317+05
44	f2022065212@umt.edu.pk	346493	admin_login	t	2026-07-20 09:49:43.658158+05	2026-07-20 09:39:43.671116+05
45	admin@careercure.com	210671	admin_login	f	2026-07-20 10:04:19.417766+05	2026-07-20 09:54:19.443208+05
46	e2e@test.com	283946	email_verification	f	2026-07-20 10:05:41.316241+05	2026-07-20 09:55:41.321378+05
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: planned_courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planned_courses (id, user_id, course_id, title, provider, course_url, duration, difficulty_level, description, roadmap, created_at) FROM stdin;
5	16	2	Machine Learning Specialization	Coursera	https://coursera.org	3 months	Intermediate	Build ML models with supervised learning, neural networks, and deployment.	Data Science	2026-07-20 09:48:42.821818+05
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, user_id, bio, skills, education, experience_years, career_goal, cv_text, cv_filename, cv_analysis, created_at, updated_at) FROM stdin;
1	1	\N	[]	\N	0	\N	\N	\N	\N	2026-06-08 01:37:54.432108+05	\N
5	6	\N	[]	\N	0	\N	\N	\N	\N	2026-07-10 21:31:56.861688+05	\N
6	7	\N	[]	\N	0	\N	\N	\N	\N	2026-07-11 13:57:08.930729+05	\N
7	8	\N	[]	\N	0	\N	\N	\N	\N	2026-07-19 12:51:33.245046+05	\N
10	11	\N	[]	\N	0	\N	\N	\N	\N	2026-07-19 15:15:20.260284+05	\N
11	12	\N	[]	\N	0	\N	\N	\N	\N	2026-07-19 20:50:21.162682+05	\N
16	17	\N	[]	\N	0	\N	\N	\N	\N	2026-07-20 09:55:41.241938+05	\N
15	16	Aspiring SE with a solid grasp of Software Development. Looking to apply technical skills in a professional setting and contribute to meaningful projects.	["python"]	\N	0	Data Science	AYESHA ZAFAR\nayeshaaazafar2004@gmail.com\n\nPROFESSIONAL SUMMARY\nSoftware developer with hands-on experience building applications and solving problems. Strong foundation in modern programming and best practices.\n\nEDUCATION\nbs se\n\nTECHNICAL SKILLS\n• python\n\nKEY PROJECTS\n• Aspiring SE with a solid grasp of Software Development. Looking to apply technical skills in a professional setting and contribute to meaningful projects.	Ayesha_Zafar_CV_Improved.txt	{"extracted_skills": ["Python", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "LangChain", "n8n", "MLOps", "Model Deployment", "Microservices", "Data Engineering", "Team Leadership", "Prompt Engineering", "LLMs", "RAG", "OCR", "Data Science", "Feature Engineering", "Model Evaluation", "Agile Development", "Scalable AI Systems"], "skill_gaps": ["Cloud Security", "DevOps", "Containerization (e.g., Kubernetes)", "Cloud-Native Development", "Machine Learning Engineering"], "strengths": ["Hands-on experience with production-ready AI solutions", "Strong understanding of MLOps and model deployment", "Experience with Agile development and team leadership", "Proficiency in multiple programming languages and frameworks"], "recommendations": ["Consider adding a section for certifications, such as AWS Certified Developer or Azure Certified Data Scientist", "Provide more details about your experience with LangChain, including specific use cases and outcomes", "In the Projects section, consider adding a brief description of the problem you were trying to solve and the impact of your solution", "In the Work Experience section, consider using bullet points to break up large blocks of text and make it easier to scan", "Consider adding a section for relevant coursework or academic projects, especially if you're a recent graduate"], "summary": "Ayesha has a strong background in AI software engineering, with hands-on experience building production-ready solutions and a solid understanding of MLOps and model deployment. However, there are some areas where she could improve her CV, such as adding more details about her experience with LangChain and cloud security. With some revisions, her CV could be even more effective at showcasing her skills and experience to potential employers."}	2026-07-20 09:47:03.781234+05	2026-07-20 09:48:31.017861+05
\.


--
-- Data for Name: roadmaps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roadmaps (id, user_id, career_goal, roadmap_data, created_at) FROM stdin;
5	16	Data Science	{"title": "Data Science Career Roadmap", "goal": "Become a proficient Data Scientist with expertise in Python and machine learning", "estimated_duration": "1-2 years", "phases": [{"phase_number": 1, "title": "Phase 1: Foundational Skills", "duration": "3-6 months", "objectives": ["Learn statistics and probability", "Understand data visualization techniques", " Familiarize with SQL and data manipulation libraries in Python (e.g. Pandas)", "Learn the basics of machine learning with scikit-learn"], "resources": [{"name": "DataCamp", "url": "https://www.datacamp.com/"}, {"name": "Kaggle", "url": "https://www.kaggle.com/"}, {"name": "Python Data Science Handbook", "url": "https://jakevdp.github.io/PythonDataScienceHandbook/"}], "milestones": ["Complete DataCamp's Python Data Science course", "Finish Kaggle's Machine Learning 101 course", "Build a simple machine learning model using scikit-learn"]}, {"phase_number": 2, "title": "Phase 2: Advanced Machine Learning", "duration": "6-9 months", "objectives": ["Learn deep learning with TensorFlow or PyTorch", "Understand natural language processing (NLP) techniques", "Familiarize with data preprocessing and feature engineering", "Learn to work with large datasets and distributed computing"], "resources": [{"name": "TensorFlow Tutorials", "url": "https://www.tensorflow.org/tutorials"}, {"name": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials"}, {"name": "Data Preprocessing with Pandas and NumPy", "url": "https://pandas.pydata.org/docs/getting_started/tutorials.html"}], "milestones": ["Build a deep learning model using TensorFlow or PyTorch", "Implement NLP techniques using NLTK or spaCy", "Work with a large dataset using Pandas and NumPy"]}, {"phase_number": 3, "title": "Phase 3: Specialization and Project Development", "duration": "6-9 months", "objectives": ["Choose a specialization (e.g. computer vision, recommender systems)", "Develop a project that showcases expertise in the chosen specialization", "Learn to communicate complex technical ideas to non-technical stakeholders", "Prepare for data science interviews and assessments"], "resources": [{"name": "Kaggle Datasets", "url": "https://www.kaggle.com/datasets"}, {"name": "Data Science Interview Questions", "url": "https://www.glassdoor.com/Interview/data-science-interview-questions-SRCH_KO0,14.htm"}, {"name": "Storytelling with Data", "url": "https://www.storytellingwithdata.com/"}], "milestones": ["Develop a project that showcases expertise in the chosen specialization", "Prepare for data science interviews and assessments", "Practice communicating complex technical ideas to non-technical stakeholders"]}], "final_outcome": "Become a proficient Data Scientist with expertise in Python and machine learning, ready for a career in industry or academia"}	2026-07-20 09:48:29.647242+05
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, full_name, hashed_password, is_active, created_at, updated_at, is_verified, oauth_provider, oauth_id, is_admin) FROM stdin;
6	jane@example.com	Jane Smith	$2b$12$SsR5jmfUWW56LhOJfxaXD.ZxFfDW3kD9vRX6IIcdgax2wBuXjonC.	t	2026-07-10 21:31:55.935389+05	\N	f	\N	\N	f
7	s2024065013@umt.edu.pk	Tayyaba Hidayat	$2b$12$1sLsizhDzfP6q/bpQDZ16OAztcHoSv/3y5pimPeybQ1czMfypDClO	t	2026-07-11 13:57:08.135516+05	2026-07-11 18:44:54.520944+05	f	\N	\N	f
3	admin@careercure.com	Admin User	$2b$12$31kA728Ro2moyewfn8kriOSVHpbs0TMam5F7Lnc4bOr50uzhScUD.	t	2026-06-27 19:03:30.152822+05	2026-07-15 22:18:26.104754+05	t	\N	\N	t
8	f2022065212@umt.edu.pk	Admin	$2b$12$LLT4BNZXfnNv4kGp/S7/yODxuue4xRfgraAaQDj46LtlZitrVPD.u	t	2026-07-19 12:51:32.733973+05	\N	t	\N	\N	t
11	qatchat+19557@test.com	Chat Tester	$2b$12$7Espxos5fwgP61TRYwiHTuxq40KFHc1qcasj9Q5ce5rSQrkUOuGXe	t	2026-07-19 15:15:19.863684+05	2026-07-19 15:15:26.592108+05	f	\N	\N	f
12	e2etest@test.com	E2E Test	$2b$12$6dnoi.TL0VKIMaYDqWZCQ.riF32R7CmZJ.qJJYwnvK80Ftsxoeej.	f	2026-07-19 20:50:20.780249+05	\N	f	\N	\N	f
1	y0685670@gmail.com	Debug Test User	$2b$12$2XOGHVDqXOE2q3.i.vqoIOcXWAzUt/82Hk0ZGweNo7Z2B.iqF75DG	t	2026-06-08 01:37:53.86527+05	2026-07-20 09:43:33.542345+05	t	\N	\N	f
16	ayeshaaazafar2004@gmail.com	Ayesha Zafar		t	2026-07-20 09:47:03.781234+05	\N	t	google	103793978921820081469	f
17	e2e@test.com	E2E User	$2b$12$vXO2iUqP8okTGUB0XquI3.YyNXw3qoVVJJxbhLOMr4ns7qwFwBkzO	f	2026-07-20 09:55:40.669664+05	\N	f	\N	\N	f
\.


--
-- Name: career_paths_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.career_paths_id_seq', 20, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 32, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_id_seq', 51, true);


--
-- Name: internships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.internships_id_seq', 44, true);


--
-- Name: otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otps_id_seq', 46, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: planned_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.planned_courses_id_seq', 5, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profiles_id_seq', 16, true);


--
-- Name: roadmaps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roadmaps_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: career_paths career_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_pkey PRIMARY KEY (id);


--
-- Name: career_paths career_paths_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_title_key UNIQUE (title);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: internships internships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: planned_courses planned_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_courses
    ADD CONSTRAINT planned_courses_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: roadmaps roadmaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_career_paths_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_career_paths_id ON public.career_paths USING btree (id);


--
-- Name: ix_chat_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_conversation_id ON public.chat_messages USING btree (conversation_id);


--
-- Name: ix_chat_messages_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_id ON public.chat_messages USING btree (id);


--
-- Name: ix_chat_messages_user_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_user_conversation ON public.chat_messages USING btree (user_id, conversation_id);


--
-- Name: ix_chat_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_user_id ON public.chat_messages USING btree (user_id);


--
-- Name: ix_courses_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_courses_id ON public.courses USING btree (id);


--
-- Name: ix_internships_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_internships_id ON public.internships USING btree (id);


--
-- Name: ix_otps_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_otps_email ON public.otps USING btree (email);


--
-- Name: ix_otps_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_otps_id ON public.otps USING btree (id);


--
-- Name: ix_password_reset_tokens_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_password_reset_tokens_id ON public.password_reset_tokens USING btree (id);


--
-- Name: ix_password_reset_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- Name: ix_planned_courses_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_planned_courses_id ON public.planned_courses USING btree (id);


--
-- Name: ix_planned_courses_user_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_planned_courses_user_course ON public.planned_courses USING btree (user_id, course_id);


--
-- Name: ix_planned_courses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_planned_courses_user_id ON public.planned_courses USING btree (user_id);


--
-- Name: ix_profiles_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_profiles_id ON public.profiles USING btree (id);


--
-- Name: ix_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: ix_roadmaps_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_roadmaps_id ON public.roadmaps USING btree (id);


--
-- Name: ix_roadmaps_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_roadmaps_user_id ON public.roadmaps USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: planned_courses planned_courses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_courses
    ADD CONSTRAINT planned_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: roadmaps roadmaps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict CbKe9cec6dWqMg2aUIWlCWlgyox17OeyC6zgmlvK8GrjeI40Yab5Oh5JLsPlzVD

