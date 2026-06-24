import { validateAndSanitizeProfile, logSecurityEvent } from './security.js';

// Career database for Planning & Guidance agents
const CAREER_DATABASE = {
  "frontend developer": {
    requiredSkills: ["html", "css", "javascript", "react", "git", "tailwind", "web performance", "responsive design", "apis"],
    phases: [
      {
        name: "Phase 1: Web Development Foundations",
        description: "Master the building blocks of the web: HTML5, CSS3 layout techniques, and modern JavaScript (ES6+).",
        durationPct: 0.3
      },
      {
        name: "Phase 2: Modern Frameworks & Tooling",
        description: "Deep dive into component-based architectures with React, build setup, utility styling with Tailwind CSS, and version control using Git.",
        durationPct: 0.4
      },
      {
        name: "Phase 3: APIs, Performance & Optimization",
        description: "Connect to RESTful/GraphQL APIs, manage state, optimize bundle sizes, and deploy fully responsive sites to platforms like Vercel or Netlify.",
        durationPct: 0.3
      }
    ],
    resources: [
      { name: "MDN Web Docs (HTML/CSS/JS)", url: "https://developer.mozilla.org", type: "Documentation", free: true },
      { name: "freeCodeCamp - Responsive Web Design", url: "https://www.freecodecamp.org", type: "Course", free: true },
      { name: "JavaScript.info - Modern JS", url: "https://javascript.info", type: "Tutorial", free: true },
      { name: "Scrimba - React Tutorial", url: "https://scrimba.com/learn/learnreact", type: "Interactive Course", free: true },
      { name: "Git & GitHub Crash Course (Traversy Media)", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "Video", free: true }
    ],
    projects: [
      {
        phase: 0,
        title: "Personal Portfolio Website",
        difficulty: "Beginner",
        description: "Build a multi-page responsive personal portfolio using semantic HTML5 and CSS3 (Flexbox/Grid). Showcases your profile, skills, and contact form.",
        checklist: ["Semantic HTML structure", "CSS Grid and Flexbox for responsiveness", "CSS variables for theme consistency", "GitHub Pages deployment"]
      },
      {
        phase: 1,
        title: "Interactive Weather Dashboard",
        difficulty: "Intermediate",
        description: "Create a React-based application that fetches real-time weather details for any city using the OpenWeather API. Features search history, unit toggling, and dynamic weather icons.",
        checklist: ["API integration using fetch/Axios", "React State & Effect hooks", "Responsive weather layout via Tailwind CSS", "Local storage cache for search history"]
      },
      {
        phase: 2,
        title: "E-Commerce Checkout System",
        difficulty: "Advanced",
        description: "Build a single-page shopping application featuring interactive cart state management, checkout summary, client-side validation, and beautiful animations.",
        checklist: ["State management (Context API or Redux)", "Safe, client-side form validation", "Framermotion/CSS transitions", "Mock Stripe checkout integration"]
      }
    ]
  },
  "backend developer": {
    requiredSkills: ["python", "node.js", "sql", "databases", "rest apis", "git", "docker", "security", "data structures", "system design"],
    phases: [
      {
        name: "Phase 1: Backend Language & DB Foundations",
        description: "Learn Node.js or Python, syntax basics, and fundamental Relational Databases using SQLite or PostgreSQL.",
        durationPct: 0.3
      },
      {
        name: "Phase 2: API Architectures & Middleware",
        description: "Understand REST API design using Express or FastAPI, user authorization/authentication (JWT), and system security.",
        durationPct: 0.4
      },
      {
        name: "Phase 3: Scaling, DevOps & Deployment",
        description: "Learn Docker containerization, caching with Redis, system architecture, database indexing, and deploying backend apps.",
        durationPct: 0.3
      }
    ],
    resources: [
      { name: "The Odin Project - NodeJS Path", url: "https://www.theodinproject.com", type: "Course", free: true },
      { name: "FastAPI Official Tutorial", url: "https://fastapi.tiangolo.com/tutorial/", type: "Documentation", free: true },
      { name: "SQLBolt - Interactive SQL", url: "https://sqlbolt.com", type: "Interactive", free: true },
      { name: "Node.js Developer Roadmap", url: "https://roadmap.sh/nodejs", type: "Roadmap", free: true },
      { name: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Tutorial", free: true }
    ],
    projects: [
      {
        phase: 0,
        title: "Task Management API",
        difficulty: "Beginner",
        description: "Build a clean command-line script or simple CRUD API that allows users to create, read, update, and delete tasks saved in a local SQLite file.",
        checklist: ["Database schema design", "Basic CRUD routes", "Input validation middleware", "Testing routes using Postman"]
      },
      {
        phase: 1,
        title: "Secured Blogging Platform API",
        difficulty: "Intermediate",
        description: "Create an Express or FastAPI backend with secure user login (JWT), password hashing (bcrypt), and post creations linked to active users.",
        checklist: ["Password encryption", "Token-based user authentication", "One-to-many DB relationships", "API error handling wrapper"]
      },
      {
        phase: 2,
        title: "Real-time Chat App Engine",
        difficulty: "Advanced",
        description: "Design a message broker server using WebSockets/Socket.io to deliver instant room-based chat messages. Includes data persistence and containerized deployment.",
        checklist: ["Bi-directional WebSocket connection", "Docker compose for Node and PostgreSQL", "Redis adapter for message scaling", "Unit tests for endpoints"]
      }
    ]
  },
  "data scientist": {
    requiredSkills: ["python", "statistics", "sql", "machine learning", "pandas", "numpy", "data visualization", "git", "scikit-learn", "jupyter"],
    phases: [
      {
        name: "Phase 1: Python, SQL & Data Wrangling",
        description: "Master Python essentials, Pandas, NumPy libraries, and intermediate SQL queries to extract and clean data.",
        durationPct: 0.3
      },
      {
        name: "Phase 2: Exploratory Data Analysis & Stats",
        description: "Learn statistics fundamentals, hypothesis testing, and standard plotting tools like Matplotlib and Seaborn.",
        durationPct: 0.3
      },
      {
        name: "Phase 3: Predictive Modeling & ML",
        description: "Implement supervised machine learning algorithms (Linear Regression, Decision Trees) using Scikit-Learn and deploy simple dashboards.",
        durationPct: 0.4
      }
    ],
    resources: [
      { name: "Kaggle Learn Courses", url: "https://www.kaggle.com/learn", type: "Interactive Course", free: true },
      { name: "Python for Data Analysis (Book Site)", url: "https://wesmckinney.com/book/", type: "Book", free: true },
      { name: "StatQuest with Josh Starmer", url: "https://www.youtube.com/c/joshstarmer", type: "Video Channel", free: true },
      { name: "SQL for Data Science (Cognitive Class)", url: "https://cognitiveclass.ai/courses/sql-data-science", type: "Course", free: true },
      { name: "Scikit-Learn Getting Started Guide", url: "https://scikit-learn.org/stable/getting_started.html", type: "Documentation", free: true }
    ],
    projects: [
      {
        phase: 0,
        title: "Clean Housing Dataset Analysis",
        difficulty: "Beginner",
        description: "Use Pandas to load, clean, and pre-process a raw housing spreadsheet. Impute missing values, convert data types, and output a clean CSV.",
        checklist: ["Detect and handle null entries", "Outlier identification", "Feature renaming & sorting", "Jupyter notebook reports"]
      },
      {
        phase: 1,
        title: "Sales Trends Dashboard",
        difficulty: "Intermediate",
        description: "Create visual interactive charts detailing monthly sales performance, top product categories, and correlation between prices and quantities using Seaborn or Streamlit.",
        checklist: ["Exploratory Data Analysis (EDA)", "Group-by and Aggregation logic", "Interactive charts", "Insightful statistical explanations"]
      },
      {
        phase: 2,
        title: "Customer Churn Predictor",
        difficulty: "Advanced",
        description: "Build, evaluate, and fine-tune a Logistic Regression or Random Forest model to predict customer churn. Calculate accuracy, precision, and recall.",
        checklist: ["Feature scaling & encoding", "Train-test data splits", "Model evaluation matrices", "Model saving using pickle/joblib"]
      }
    ]
  },
  "cyber security analyst": {
    requiredSkills: ["networking", "linux", "security principles", "penetration testing", "cryptography", "wireshark", "git", "firewalls"],
    phases: [
      {
        name: "Phase 1: Networks & Operating Systems",
        description: "Understand TCP/IP architectures, DNS, subnetting, Linux command lines, and fundamental OS administration.",
        durationPct: 0.3
      },
      {
        name: "Phase 2: Security Concepts & Analysis Tools",
        description: "Explore core threat landscapes, system hardening, using Wireshark for traffic sniffing, and port scanning with Nmap.",
        durationPct: 0.4
      },
      {
        name: "Phase 3: Defensive Ops & Cryptography",
        description: "Learn symmetric/asymmetric encryptions, intrusion detection, logs parsing, and basic penetration testing guidelines.",
        durationPct: 0.3
      }
    ],
    resources: [
      { name: "TryHackMe (Free Modules)", url: "https://tryhackme.com", type: "Lab Platform", free: true },
      { name: "Professor Messer Security+ Course", url: "https://www.professormesser.com", type: "Video Course", free: true },
      { name: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", type: "Interactive Lab", free: true },
      { name: "Wireshark User Guide", url: "https://www.wireshark.org/docs/", type: "Documentation", free: true }
    ],
    projects: [
      {
        phase: 0,
        title: "Secure Network Audit Report",
        difficulty: "Beginner",
        description: "Map and analyze a simple local network. Document open ports, connected IP addresses, and draft security improvement recommendations.",
        checklist: ["IP scanner tool usage", "Port classification report", "Threat model analysis", "Plaintext security checklist"]
      },
      {
        phase: 1,
        title: "Wireshark Packet Analysis Lab",
        difficulty: "Intermediate",
        description: "Capture and review network packets using Wireshark. Identify unencrypted credentials, find abnormal traffic volumes, and track IP communications.",
        checklist: ["Packet captures filtering", "Extracting plain-text HTTP files", "Identifying unauthorized pings", "Audit log generation"]
      },
      {
        phase: 2,
        title: "Autogenerated Vulnerability Scanner",
        difficulty: "Advanced",
        description: "Write a custom Python script that performs safe, targeted scans on a local server, checking for outdated dependencies and weak password ports.",
        checklist: ["Socket-based port scanner", "Regex for version checks", "Safe exception handling", "HTML report generator"]
      }
    ]
  }
};

// Fallback career profile generator for unlisted career goals
function getDynamicCareerData(goal) {
  const goalLower = goal.toLowerCase();
  
  // Try to find a matching career in the database
  for (const [key, data] of Object.entries(CAREER_DATABASE)) {
    if (goalLower.includes(key) || key.includes(goalLower)) {
      return data;
    }
  }

  // If no match, dynamically construct one based on goal keywords
  return {
    requiredSkills: [goalLower.replace(/\s+/g, '-'), "git", "problem-solving", "data-structures", "apis", "collaboration"],
    phases: [
      {
        name: "Phase 1: Foundations of " + goal,
        description: "Establish baseline core concepts, fundamental principles, and essential tools required for " + goal + ".",
        durationPct: 0.3
      },
      {
        name: "Phase 2: Practical Implementation & Workflow",
        description: "Apply your base skills to real-world architectures, standard practices, and collaborative pipelines.",
        durationPct: 0.4
      },
      {
        name: "Phase 3: Advanced Optimization & Deployment",
        description: "Fine-tune performance, learn security guidelines, build portfolio systems, and prepare for industry entry.",
        durationPct: 0.3
      }
    ],
    resources: [
      { name: "Google & YouTube Developer Search", url: "https://google.com", type: "Search Engine", free: true },
      { name: "freeCodeCamp YouTube Library", url: "https://www.youtube.com/c/freecodecamp", type: "Video Channel", free: true },
      { name: "Roadmap.sh Developer Guides", url: "https://roadmap.sh", type: "Roadmaps", free: true }
    ],
    projects: [
      {
        phase: 0,
        title: "Introductory Concept Showcase",
        difficulty: "Beginner",
        description: "Build a basic sandbox prototype mapping out the core concepts of a " + goal + ".",
        checklist: ["Document core definitions", "Draft basic system diagrams", "Establish standard workspace settings"]
      },
      {
        phase: 1,
        title: "Real-world Practical Application",
        difficulty: "Intermediate",
        description: "Develop a functional utility project solving a realistic problem in the " + goal + " domain.",
        checklist: ["Interactive features", "Data structures representation", "Modular codebase layout"]
      },
      {
        phase: 2,
        title: "Comprehensive Capstone Portfolio",
        difficulty: "Advanced",
        description: "Construct an end-to-end deployed portfolio application demonstrating top-tier execution of " + goal + " skills.",
        checklist: ["Secure data usage", "Clean responsive layouts", "Optimized execution flow"]
      }
    ]
  };
}

/**
 * Orchestrator class to manage agent communication logs
 */
class AgentLogger {
  constructor() {
    this.logs = [];
  }
  
  log(agentName, message) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, agent: agentName, message };
    this.logs.push(entry);
    
    // Dispatch custom event for frontend updates
    const customEvent = new CustomEvent('agent-collaboration-log', { detail: entry });
    window.dispatchEvent(customEvent);
  }
  
  clear() {
    this.logs = [];
  }
}

export const agentLogger = new AgentLogger();

/**
 * 1. Profile Agent
 * Collects, validates, and packages student profiles.
 */
export const ProfileAgent = {
  name: "Profile Agent",
  
  processOnboarding(rawInput) {
    agentLogger.log(this.name, "Initializing onboarding workflow...");
    agentLogger.log(this.name, "Validating and sanitizing student profile parameters...");
    
    const results = validateAndSanitizeProfile(rawInput);
    
    if (!results.isValid) {
      agentLogger.log(this.name, "Profile validation failed! Sending issues back to user.");
      return { status: "error", errors: results.errors };
    }
    
    agentLogger.log(this.name, "Profile validated successfully.");
    agentLogger.log(this.name, `Parsed Education: "${results.sanitizedProfile.education}"`);
    agentLogger.log(this.name, `Parsed Career Goal: "${results.sanitizedProfile.goal}"`);
    agentLogger.log(this.name, `Current skills parsed: [${results.sanitizedProfile.skills.join(', ')}]`);
    agentLogger.log(this.name, `Target study load: ${results.sanitizedProfile.studyHours} hours/week`);
    
    agentLogger.log(this.name, "Handoff to Planning Agent for skill gap analysis and roadmap scheduling...");
    
    return { status: "success", profile: results.sanitizedProfile };
  }
};

/**
 * 2. Planning Agent
 * Performs gap analysis, schedules study timeline, and structures weekly tasks.
 */
export const PlanningAgent = {
  name: "Planning Agent",
  
  generateLearningPath(profile) {
    agentLogger.log(this.name, `Received sanitized profile for target role: "${profile.goal}".`);
    agentLogger.log(this.name, "Analyzing skill requirements database...");
    
    const careerData = getDynamicCareerData(profile.goal);
    
    // 1. Skill Gap Analysis
    const currentSkills = new Set(profile.skills);
    const requiredSkills = careerData.requiredSkills;
    
    const skillsToLearn = requiredSkills.filter(skill => !currentSkills.has(skill));
    const matchingSkills = requiredSkills.filter(skill => currentSkills.has(skill));
    
    agentLogger.log(this.name, `Skill Match: ${matchingSkills.length}/${requiredSkills.length} required skills identified.`);
    agentLogger.log(this.name, `Identified skill gaps: [${skillsToLearn.join(', ')}]`);
    
    // 2. Roadmap Generation
    agentLogger.log(this.name, "Drafting 3-Phase custom timeline structure...");
    const roadmapPhases = careerData.phases.map(phase => {
      // Map skills to phases based on keywords
      const phaseSkills = skillsToLearn.filter(skill => {
        // basic keyword sorting to make phases realistic
        if (phase.name.toLowerCase().includes("foundation") || phase.name.toLowerCase().includes("phase 1")) {
          return skill.match(/(html|css|python|networking|linux|problem-solving|statistics)/i);
        }
        if (phase.name.toLowerCase().includes("framework") || phase.name.toLowerCase().includes("phase 2")) {
          return skill.match(/(react|node|javascript|sql|database|security|git|api)/i);
        }
        return true; // Put remaining skills in Phase 3
      });
      
      return {
        ...phase,
        skillsCovered: phaseSkills.length > 0 ? phaseSkills : ["General " + profile.goal + " Competency"]
      };
    });
    
    // 3. Weekly Schedule Generation
    agentLogger.log(this.name, `Distributing weekly budget of ${profile.studyHours} hours across study calendar...`);
    const dailyHours = Math.round((profile.studyHours / 5) * 10) / 10; // Spread across 5 study days (Mon-Fri)
    const schedule = {
      Monday: { hours: dailyHours, topic: `Foundational study of: ${skillsToLearn[0] || 'Core concepts'}` },
      Tuesday: { hours: dailyHours, topic: `Practical syntax & labs: ${skillsToLearn[1] || 'Hands-on tools'}` },
      Wednesday: { hours: dailyHours, topic: `Mini-exercises & debugging practice` },
      Thursday: { hours: dailyHours, topic: `Core development workflows: ${skillsToLearn[2] || 'Development setups'}` },
      Friday: { hours: dailyHours, topic: `End-of-week revision & portfolio code build` },
      Saturday: { hours: 0, topic: `Off-day (Review & rest)` },
      Sunday: { hours: 0, topic: `Off-day (Rest)` }
    };
    
    // Adjust weekend slightly if hours are high (>30 hrs/week)
    if (profile.studyHours > 30) {
      const weekendDaily = Math.round((profile.studyHours / 7) * 10) / 10;
      Object.keys(schedule).forEach(day => {
        schedule[day].hours = weekendDaily;
        if (day === 'Saturday' || day === 'Sunday') {
          schedule[day].topic = `Intensive bootcamp study & complex project implementation`;
        }
      });
    }

    agentLogger.log(this.name, "Roadmap and Study Schedule created.");
    agentLogger.log(this.name, "Handoff to Guidance Agent to retrieve target study materials and projects...");
    
    return {
      skillsToLearn,
      matchingSkills,
      phases: roadmapPhases,
      weeklySchedule: schedule
    };
  }
};

/**
 * 3. Guidance Agent
 * Curates free study material and recommends project ideas.
 */
export const GuidanceAgent = {
  name: "Guidance Agent",
  
  curateResourcesAndProjects(goal, roadmapResult) {
    agentLogger.log(this.name, `Received learning path for career target: "${goal}".`);
    agentLogger.log(this.name, "Curating free high-quality study resources...");
    
    const careerData = getDynamicCareerData(goal);
    const resources = careerData.resources;
    
    agentLogger.log(this.name, `Retrieved ${resources.length} free educational resources.`);
    agentLogger.log(this.name, "Custom designing student project briefs for each phase...");
    
    const projects = careerData.projects;
    agentLogger.log(this.name, `Compiled ${projects.length} project blueprints matching current gap levels.`);
    
    agentLogger.log(this.name, "Final recommendation package ready for the student.");
    
    return {
      resources,
      projects
    };
  }
};

/**
 * System Orchestrator
 * Performs the complete agent collaboration workflow.
 */
export function runAgentWorkflow(rawInput) {
  agentLogger.clear();
  logSecurityEvent('System', 'Beginning Multi-Agent Career Orchestrator process.', 'SAFE');
  
  // 1. Profile Agent processing
  const profileRes = ProfileAgent.processOnboarding(rawInput);
  if (profileRes.status === "error") {
    return { status: "error", errors: profileRes.errors };
  }
  
  const studentProfile = profileRes.profile;
  
  // 2. Planning Agent processing
  const planningRes = PlanningAgent.generateLearningPath(studentProfile);
  
  // 3. Guidance Agent processing
  const guidanceRes = GuidanceAgent.curateResourcesAndProjects(studentProfile.goal, planningRes);
  
  logSecurityEvent('System', 'Multi-Agent Career Orchestrator workflow completed.', 'SAFE');
  
  return {
    status: "success",
    data: {
      profile: studentProfile,
      planning: planningRes,
      guidance: guidanceRes
    }
  };
}
