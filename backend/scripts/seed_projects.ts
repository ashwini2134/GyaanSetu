import { prisma } from "../src/prisma.js";

const projectsData = [
  {
    id: "calculator",
    title: "Calculator",
    category: "Beginner Level",
    difficulty: "Beginner",
    shortDescription: "A simple arithmetic calculator built with foundational logic.",
    longDescription: "Build a fully functional calculator that can handle basic arithmetic operations like addition, subtraction, multiplication, and division. This project will help you understand state management, event handling, and conditional logic.",
    technologies: ["HTML", "CSS", "JavaScript"],
    features: ["Add, subtract, multiply, and divide numbers", "Clear the display", "Handle decimal points and continuous operations"],
    instructions: [
      "Set up the HTML structure with a display area and buttons for numbers and operators.",
      "Style the calculator using CSS grid for a clean layout.",
      "Write JavaScript to capture button clicks and update the display.",
      "Implement the calculation logic using variables to store current and previous operands."
    ],
    expectedOutput: "A visually appealing calculator that computes mathematical expressions accurately.",
    estimatedDuration: "2-4 hours",
    prerequisites: ["Basic HTML/CSS", "JavaScript functions and events"],
    learningOutcomes: ["DOM manipulation", "Event listeners", "Basic algorithms"]
  },
  {
    id: "to-do-app",
    title: "To-Do App",
    category: "Beginner Level",
    difficulty: "Beginner",
    shortDescription: "Manage daily tasks with this interactive to-do list application.",
    longDescription: "Create a to-do list application where users can add, edit, complete, and delete tasks. You will learn about handling user input, managing arrays of objects, and persisting data securely in a backend database.",
    technologies: ["HTML", "CSS", "JavaScript", "REST APIs"],
    features: ["Add new tasks", "Mark tasks as complete", "Delete tasks", "Save tasks to database via APIs"],
    instructions: [
      "Create an input field and an 'Add' button.",
      "Display the list of tasks below the input area.",
      "Add event listeners to toggle task completion status and to delete tasks.",
      "Integrate REST APIs to save and load tasks from the server."
    ],
    expectedOutput: "A functional task tracker that remembers your tasks securely on the backend.",
    estimatedDuration: "3-5 hours",
    prerequisites: ["JavaScript Arrays", "DOM Manipulation", "Basic Fetch API"],
    learningOutcomes: ["CRUD operations in JS", "API Integration"]
  },
  {
    id: "stopwatch",
    title: "Stopwatch",
    category: "Beginner Level",
    difficulty: "Beginner",
    shortDescription: "A precise stopwatch with start, stop, and reset functionality.",
    longDescription: "Develop a digital stopwatch that tracks time in minutes, seconds, and milliseconds. This project is excellent for understanding JavaScript timing events like setInterval and clearInterval.",
    technologies: ["HTML", "CSS", "JavaScript"],
    features: ["Start, pause, and reset the timer", "Record lap times", "Format time beautifully (MM:SS:ms)"],
    instructions: [
      "Create the UI displaying 00:00:00 and buttons for Start, Stop, and Reset.",
      "Use setInterval to increment time every 10 milliseconds when started.",
      "Format the output so single digits have a leading zero.",
      "Implement pause logic by clearing the interval, and reset logic to clear the time variable."
    ],
    expectedOutput: "A responsive stopwatch with accurate time tracking.",
    estimatedDuration: "2-3 hours",
    prerequisites: ["JavaScript timing functions"],
    learningOutcomes: ["setInterval/clearInterval", "Date/Time formatting"]
  },
  {
    id: "portfolio-website",
    title: "Portfolio Website",
    category: "Beginner Level",
    difficulty: "Beginner",
    shortDescription: "A personal portfolio site to showcase your skills and projects.",
    longDescription: "Design and code a multi-section personal portfolio website. This project focuses on modern CSS layouts, responsive design, and structuring HTML semantically.",
    technologies: ["HTML", "CSS", "Flexbox/Grid"],
    features: ["About Me section", "Projects showcase", "Contact form (UI only)", "Responsive navigation menu"],
    instructions: [
      "Create a semantic HTML skeleton (header, nav, main, footer).",
      "Use CSS Flexbox or Grid to align elements.",
      "Add media queries to ensure the site looks great on mobile devices.",
      "Include smooth scrolling for navigation links."
    ],
    expectedOutput: "A professional, responsive portfolio ready to be deployed to GitHub Pages.",
    estimatedDuration: "5-8 hours",
    prerequisites: ["HTML semantics", "CSS layout basics"],
    learningOutcomes: ["Responsive Web Design", "CSS Media Queries"]
  },
  {
    id: "weather-app",
    title: "Weather App",
    category: "Beginner Level",
    difficulty: "Beginner",
    shortDescription: "Real-time weather application fetching data from a public API.",
    longDescription: "Build an application that allows users to search for a city and see the current weather conditions. This is a crucial project for learning how to work with asynchronous JavaScript, APIs, and JSON data.",
    technologies: ["JavaScript", "Fetch API", "CSS"],
    features: ["Search by city name", "Display temperature, humidity, and wind speed", "Show weather icons"],
    instructions: [
      "Sign up for a free weather API key (e.g., OpenWeatherMap).",
      "Create a search input and button.",
      "Use the Fetch API to request data for the entered city.",
      "Parse the JSON response and update the DOM with the relevant data."
    ],
    expectedOutput: "An app that visually displays real-time weather data based on user search.",
    estimatedDuration: "4-6 hours",
    prerequisites: ["Promises and Async/Await", "Basic API concepts"],
    learningOutcomes: ["REST APIs", "JSON parsing", "Error handling"]
  },

  {
    id: "expense-tracker",
    title: "Expense Tracker",
    category: "Intermediate Level",
    difficulty: "Intermediate",
    shortDescription: "Track income and expenses with visual charts and categories.",
    longDescription: "Create a comprehensive expense tracker. Users can add transactions (income or expense), categorize them, and see a running balance. Integrate a charting library to visualize spending habits.",
    technologies: ["React", "Chart.js", "Tailwind CSS"],
    features: ["Add, edit, delete transactions", "Calculate total income, expense, and balance", "Visualize data with pie charts"],
    instructions: [
      "Set up a React project.",
      "Create a form to input transaction details (text, amount, type).",
      "Maintain the transaction list in state and calculate totals dynamically.",
      "Integrate Chart.js to render a pie chart summarizing expenses by category."
    ],
    expectedOutput: "A functional dashboard showing financial health and history.",
    estimatedDuration: "8-12 hours",
    prerequisites: ["React basics (hooks, state)", "Array methods (reduce, filter)"],
    learningOutcomes: ["State management", "Third-party library integration"]
  },
  {
    id: "quiz-application",
    title: "Quiz Application",
    category: "Intermediate Level",
    difficulty: "Intermediate",
    shortDescription: "Interactive quiz app with multiple-choice questions and scoring.",
    longDescription: "Build a dynamic quiz application that fetches questions from an API (like OpenTDB) or a local JSON file. It should handle score tracking, timer (optional), and show a final results screen.",
    technologies: ["React", "TypeScript", "CSS Modules"],
    features: ["Fetch dynamic questions", "Track score and progress", "Show correct/incorrect answers instantly", "Final summary screen"],
    instructions: [
      "Create components for the Question Card, Score Board, and Results.",
      "Manage current question index and score in React state.",
      "Implement logic to disable options once an answer is selected.",
      "Calculate the final score and offer a 'Play Again' button."
    ],
    expectedOutput: "A polished quiz experience with immediate feedback and scoring.",
    estimatedDuration: "6-10 hours",
    prerequisites: ["React Props/State", "Conditional Rendering"],
    learningOutcomes: ["Complex state logic", "TypeScript interfaces for API data"]
  },
  {
    id: "blog-website",
    title: "Blog Website",
    category: "Intermediate Level",
    difficulty: "Intermediate",
    shortDescription: "A full-fledged blogging platform with article creation and viewing.",
    longDescription: "Develop a blogging platform where users can read posts, and an admin can create new posts. Use a headless CMS or a simple backend (like Firebase or JSON Server) to store post data.",
    technologies: ["React Router", "Markdown", "Firebase/Supabase"],
    features: ["Home page with post excerpts", "Dynamic routing for individual posts", "Markdown rendering for post content"],
    instructions: [
      "Set up React Router for navigation (/ and /post/:id).",
      "Connect to a database to fetch post summaries and full content.",
      "Use a Markdown parser to render the blog post body safely.",
      "Create a basic form to submit new posts to the database."
    ],
    expectedOutput: "A multi-page SPA (Single Page Application) with database integration.",
    estimatedDuration: "10-15 hours",
    prerequisites: ["React Router", "Basic database concepts"],
    learningOutcomes: ["Client-side routing", "BaaS (Backend as a Service) integration"]
  },
  {
    id: "chat-application",
    title: "Chat Application",
    category: "Intermediate Level",
    difficulty: "Intermediate",
    shortDescription: "Real-time messaging application with multiple user rooms.",
    longDescription: "Build a real-time chat room application using WebSockets. Users should be able to join with a username and send messages to everyone in the room instantly.",
    technologies: ["Node.js", "Socket.io", "React"],
    features: ["Real-time bidirectional communication", "User join/leave notifications", "Auto-scroll to newest message"],
    instructions: [
      "Set up a Node.js Express server with Socket.io attached.",
      "Create the React frontend to connect to the socket server.",
      "Emit events when a user sends a message, and listen for incoming messages.",
      "Display messages in a chat window."
    ],
    expectedOutput: "A working chat room where multiple browser tabs can talk to each other in real-time.",
    estimatedDuration: "12-16 hours",
    prerequisites: ["Node.js basics", "Understanding of WebSockets"],
    learningOutcomes: ["Real-time data flow", "Socket.io implementation"]
  },
  {
    id: "library-management-system",
    title: "Library Management System",
    category: "Intermediate Level",
    difficulty: "Intermediate",
    shortDescription: "System to manage book inventories, issuing, and returns.",
    longDescription: "Create a dashboard for librarians to manage books and members. You will build a system to add books, issue books to members, track due dates, and calculate fines.",
    technologies: ["React", "Node.js", "Express", "MongoDB"],
    features: ["CRUD operations for Books and Members", "Issue/Return workflow", "Search and filter inventory"],
    instructions: [
      "Design the MongoDB schemas for Books and Transactions.",
      "Build RESTful API endpoints for managing the data.",
      "Create a React frontend dashboard to consume the APIs.",
      "Implement form validation and error handling."
    ],
    expectedOutput: "A full MERN stack application with relational data concepts.",
    estimatedDuration: "15-20 hours",
    prerequisites: ["REST API concepts", "MERN stack basics"],
    learningOutcomes: ["Full-stack integration", "Database modeling"]
  },

  {
    id: "ai-chatbot",
    title: "AI Chatbot",
    category: "Advanced Level",
    difficulty: "Advanced",
    shortDescription: "An intelligent chatbot integrated with NLP APIs for smart responses.",
    longDescription: "Develop a sophisticated conversational interface powered by an LLM (Large Language Model) like OpenAI API. Implement context memory, streaming responses, and UI elements like typing indicators.",
    technologies: ["React", "Next.js", "OpenAI API", "Tailwind CSS"],
    features: ["Context-aware conversations", "Server-Sent Events (Streaming)", "Markdown rendering in chat", "Conversation history saving"],
    instructions: [
      "Set up a Next.js API route to securely communicate with the OpenAI API.",
      "Build a chat UI resembling ChatGPT.",
      "Implement a streaming response reader to show text as it generates.",
      "Save conversation history locally or in a database to maintain context."
    ],
    expectedOutput: "A fast, smart, streaming AI chat interface.",
    estimatedDuration: "15-25 hours",
    prerequisites: ["Next.js API routes", "Understanding of Promises/Streams"],
    learningOutcomes: ["LLM Integration", "Streaming data handling", "Prompt engineering basics"]
  },
  {
    id: "e-commerce-platform",
    title: "E-Commerce Platform",
    category: "Advanced Level",
    difficulty: "Advanced",
    shortDescription: "A complete online store with cart, checkout, and payment gateways.",
    longDescription: "Build a comprehensive e-commerce solution. This involves product listings, search/filtering, a shopping cart, user authentication, and integrating Stripe for processing payments.",
    technologies: ["Next.js", "Stripe API", "PostgreSQL", "Prisma"],
    features: ["User authentication & profiles", "Shopping cart state management", "Secure checkout with Stripe", "Admin panel for products"],
    instructions: [
      "Model your database for Users, Products, and Orders.",
      "Implement a global state (Zustand/Redux) for the shopping cart.",
      "Integrate Stripe Checkout sessions.",
      "Secure API routes and implement webhooks to fulfill orders upon payment."
    ],
    expectedOutput: "A production-ready e-commerce store capable of taking real payments (in test mode).",
    estimatedDuration: "30-40 hours",
    prerequisites: ["Advanced React", "Relational Databases", "Authentication"],
    learningOutcomes: ["Payment Gateway Integration", "Complex State Management", "Webhooks"]
  },
  {
    id: "video-streaming-platform",
    title: "Video Streaming Platform",
    category: "Advanced Level",
    difficulty: "Advanced",
    shortDescription: "High-performance platform for uploading and streaming video content.",
    longDescription: "Create a platform similar to YouTube. Focus on video uploading, transcoding, adaptive bitrate streaming (HLS), and a responsive video player UI.",
    technologies: ["React", "Node.js", "AWS S3", "FFmpeg"],
    features: ["Video chunk uploading", "HLS streaming generation", "Custom video player controls", "Comments and likes system"],
    instructions: [
      "Set up a Node.js server to handle multipart video uploads.",
      "Use FFmpeg to convert uploaded videos into HLS (.m3u8) format.",
      "Upload segments to cloud storage (e.g., AWS S3).",
      "Build a React frontend using a library like video.js to play the streams."
    ],
    expectedOutput: "A scalable video platform with buffered streaming.",
    estimatedDuration: "40-50 hours",
    prerequisites: ["Node.js streams", "Cloud storage concepts"],
    learningOutcomes: ["Media encoding/transcoding", "Multipart uploads", "HLS protocol"]
  },
  {
    id: "online-compiler",
    title: "Online Compiler",
    category: "Advanced Level",
    difficulty: "Advanced",
    shortDescription: "Web-based code execution environment for multiple languages.",
    longDescription: "Build an online IDE where users can write code in languages like Python or JavaScript and execute it safely on the server. Requires understanding of sandboxing and Docker.",
    technologies: ["React", "Monaco Editor", "Docker", "Node.js"],
    features: ["Syntax highlighting editor", "Secure code execution", "Standard output/error streaming", "Multiple language support"],
    instructions: [
      "Integrate Monaco Editor in the React frontend.",
      "Set up a backend API that accepts code submissions.",
      "Use Docker SDK to spin up isolated, ephemeral containers to run the code securely.",
      "Capture the stdout/stderr and return it to the client."
    ],
    expectedOutput: "A fast, secure code playground.",
    estimatedDuration: "25-35 hours",
    prerequisites: ["Docker basics", "OS Process management"],
    learningOutcomes: ["Containerization", "Security/Sandboxing", "WebSocket/Streams"]
  },
  {
    id: "lms-system",
    title: "LMS System",
    category: "Advanced Level",
    difficulty: "Advanced",
    shortDescription: "A learning management system with courses, lectures, and quizzes.",
    longDescription: "Create a full LMS (Learning Management System) architecture. Students can enroll in courses, track progress, take quizzes, and earn certificates. Instructors can manage curriculum.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
    features: ["Role-based access (Student/Instructor/Admin)", "Progress tracking and persistence", "Interactive course builder", "Video lecture support"],
    instructions: [
      "Design a robust schema for Courses, Modules, Lessons, and UserProgress.",
      "Implement authentication and role middleware.",
      "Build an intuitive UI for students to navigate course content.",
      "Build an instructor dashboard with drag-and-drop lesson reordering."
    ],
    expectedOutput: "A comprehensive educational platform similar to Udemy or Coursera.",
    estimatedDuration: "40-60 hours",
    prerequisites: ["Full-stack architecture", "RBAC (Role Based Access Control)"],
    learningOutcomes: ["Complex relational data", "Multi-tenant architecture design"]
  },

  {
    id: "sentiment-analysis",
    title: "Sentiment Analysis",
    category: "AI/ML Projects",
    difficulty: "Intermediate",
    shortDescription: "Analyze text to determine emotional tone using machine learning.",
    longDescription: "Build a Python-based machine learning model that classifies text (like movie reviews or tweets) into positive, negative, or neutral sentiments. Deploy it with a web interface.",
    technologies: ["Python", "Scikit-Learn", "NLTK", "Flask/FastAPI", "React"],
    features: ["Text preprocessing (tokenization, stemming)", "TF-IDF vectorization", "Logistic Regression / Naive Bayes model", "REST API for prediction"],
    instructions: [
      "Collect and clean a dataset (e.g., IMDB reviews).",
      "Train a classification model using Scikit-Learn.",
      "Wrap the trained model in a FastAPI endpoint.",
      "Create a React frontend to accept user text and display the sentiment result."
    ],
    expectedOutput: "A web app that instantly predicts the sentiment of user-provided text.",
    estimatedDuration: "15-20 hours",
    prerequisites: ["Python programming", "Basic statistics"],
    learningOutcomes: ["NLP (Natural Language Processing)", "Model Deployment", "API creation"]
  },
  {
    id: "resume-analyzer",
    title: "Resume Analyzer",
    category: "AI/ML Projects",
    difficulty: "Advanced",
    shortDescription: "Parse and evaluate resumes against job descriptions automatically.",
    longDescription: "Develop an AI tool that extracts text from PDF resumes, identifies key skills using Named Entity Recognition (NER), and calculates a match score against a given job description.",
    technologies: ["Python", "Spacy", "PyPDF2", "FastAPI"],
    features: ["PDF text extraction", "Skill keyword matching", "Cosine similarity scoring", "Data visualization of match results"],
    instructions: [
      "Implement a PDF parsing script to extract raw text.",
      "Use Spacy NLP to identify entities and skills.",
      "Calculate the TF-IDF cosine similarity between the resume and job description.",
      "Return a structured JSON report to the frontend."
    ],
    expectedOutput: "An automated ATS (Applicant Tracking System) simulation tool.",
    estimatedDuration: "20-30 hours",
    prerequisites: ["NLP concepts", "File handling in Python"],
    learningOutcomes: ["Information Extraction", "Similarity Metrics"]
  },
  {
    id: "image-classification",
    title: "Image Classification",
    category: "AI/ML Projects",
    difficulty: "Advanced",
    shortDescription: "Deep learning model to classify and label images from datasets.",
    longDescription: "Build a Convolutional Neural Network (CNN) to classify images (e.g., cats vs dogs, or medical imaging). Train the model and serve it via a web application.",
    technologies: ["Python", "TensorFlow/PyTorch", "OpenCV", "Next.js"],
    features: ["Image preprocessing and augmentation", "CNN architecture design", "Model training and evaluation", "Drag-and-drop web interface for inference"],
    instructions: [
      "Prepare your image dataset and split into train/val sets.",
      "Define and compile a CNN using TensorFlow or PyTorch.",
      "Train the model, optimizing hyperparameters to reduce loss.",
      "Export the model and serve predictions via a backend API."
    ],
    expectedOutput: "An AI system that accurately identifies the subject of uploaded images.",
    estimatedDuration: "30-40 hours",
    prerequisites: ["Calculus & Linear Algebra basics", "Python"],
    learningOutcomes: ["Deep Learning (CNNs)", "Computer Vision basics", "Model exporting"]
  },
  {
    id: "recommendation-system",
    title: "Recommendation System",
    category: "AI/ML Projects",
    difficulty: "Advanced",
    shortDescription: "Suggest products or content based on user behavior patterns.",
    longDescription: "Implement a collaborative filtering or content-based recommendation engine. Used to suggest movies, products, or articles to users based on their historical preferences.",
    technologies: ["Python", "Pandas", "Scikit-Learn", "Surprise Library"],
    features: ["Matrix factorization", "User-user & Item-item collaborative filtering", "Cold start handling"],
    instructions: [
      "Process a user-item interaction dataset (like MovieLens).",
      "Implement a baseline content-based filter using cosine similarity.",
      "Implement collaborative filtering using Matrix Factorization (SVD).",
      "Evaluate the model using RMSE."
    ],
    expectedOutput: "An API that takes a user ID and returns the top 5 recommended items.",
    estimatedDuration: "20-30 hours",
    prerequisites: ["Data Manipulation (Pandas)", "Machine Learning concepts"],
    learningOutcomes: ["Recommendation Algorithms", "Matrix operations"]
  },

  {
    id: "banking-system",
    title: "Banking System",
    category: "Industry Projects",
    difficulty: "Advanced",
    shortDescription: "Secure transaction processing and account management system.",
    longDescription: "Build an enterprise-level banking simulator. Focus heavily on ACID database transactions, security, role-based access, and audit logging.",
    technologies: ["Java/Spring Boot OR Node.js", "PostgreSQL", "Redis", "React"],
    features: ["Secure transfers with database transactions", "Concurrent request handling (prevent double spend)", "Audit trails", "JWT Authentication"],
    instructions: [
      "Design a strictly normalized database schema.",
      "Implement APIs for deposit, withdrawal, and transfer using SQL Transactions (BEGIN, COMMIT, ROLLBACK).",
      "Add Redis for session management and rate limiting.",
      "Build a secure dashboard for users to view account history."
    ],
    expectedOutput: "A highly secure, robust financial ledger system.",
    estimatedDuration: "40-50 hours",
    prerequisites: ["Advanced SQL", "Backend Architecture", "Security Principles"],
    learningOutcomes: ["ACID properties", "Concurrency Control", "Enterprise Security"]
  },
  {
    id: "hospital-management-system",
    title: "Hospital Management System",
    category: "Industry Projects",
    difficulty: "Advanced",
    shortDescription: "Comprehensive platform for patient records and doctor appointments.",
    longDescription: "Develop a system to handle hospital operations: Patient Registration, Appointment Scheduling, EHR (Electronic Health Records), and Billing.",
    technologies: ["Next.js", "GraphQL", "PostgreSQL", "Docker"],
    features: ["Calendar-based scheduling", "Role-specific dashboards (Admin, Doctor, Patient)", "Secure file storage for lab reports", "Invoice generation"],
    instructions: [
      "Map out the complex relationships between Patients, Doctors, Appointments, and Records.",
      "Implement a GraphQL API for flexible data querying.",
      "Build an interactive calendar for booking appointments without conflicts.",
      "Implement HIPAA-compliant data handling practices (conceptually)."
    ],
    expectedOutput: "A multi-portal application streamlining healthcare administration.",
    estimatedDuration: "50-60 hours",
    prerequisites: ["Relational Database Design", "GraphQL"],
    learningOutcomes: ["Complex Data Modeling", "Multi-portal architecture", "API Design"]
  },
  {
    id: "food-delivery-app",
    title: "Food Delivery App",
    category: "Industry Projects",
    difficulty: "Advanced",
    shortDescription: "End-to-end food ordering and delivery tracking application.",
    longDescription: "Create a clone of UberEats or DoorDash. This requires a User App, a Restaurant Dashboard, and a Delivery Driver App, all communicating in real-time.",
    technologies: ["React Native", "Node.js", "MongoDB", "Google Maps API"],
    features: ["Geospatial queries to find nearby restaurants", "Real-time order tracking (WebSockets)", "Push notifications", "Complex cart logic with modifiers"],
    instructions: [
      "Use MongoDB GeoJSON to store restaurant locations and query nearby options.",
      "Implement a cart system that handles add-ons and taxes.",
      "Use Socket.io to update order status (Preparing -> Picked Up -> Delivered) in real-time.",
      "Integrate Maps API for routing and distance calculation."
    ],
    expectedOutput: "A distributed system coordinating three different user types simultaneously.",
    estimatedDuration: "60-80 hours",
    prerequisites: ["Microservices/Distributed Systems concepts", "Mobile/Web App development"],
    learningOutcomes: ["Geospatial Data", "Real-time coordination", "Push Notifications"]
  },
  {
    id: "inventory-management-system",
    title: "Inventory Management System",
    category: "Industry Projects",
    difficulty: "Advanced",
    shortDescription: "Enterprise-grade system for tracking stock levels and orders.",
    longDescription: "Build a robust ERP (Enterprise Resource Planning) module for inventory. Handle purchase orders, supplier management, stock alerts, and barcode scanning.",
    technologies: ["Vue/React", "C# .NET or Node.js", "SQL Server / PostgreSQL"],
    features: ["Low stock threshold alerts", "Purchase order generation", "Dashboard analytics", "Barcode/QR code generation and scanning"],
    instructions: [
      "Model Suppliers, Warehouses, Products, and Stock Movements.",
      "Build aggregate queries to calculate current stock dynamically or via triggers.",
      "Implement a background job to send email alerts for low stock.",
      "Create a printable reports module using PDF generation."
    ],
    expectedOutput: "A B2B dashboard capable of handling thousands of SKUs.",
    estimatedDuration: "40-50 hours",
    prerequisites: ["SQL optimization", "Backend engineering"],
    learningOutcomes: ["ERP concepts", "Background processing", "Reporting/Analytics"]
  },

  {
    id: "full-stack-capstone",
    title: "Full Stack Masterpiece",
    category: "Capstone Projects",
    difficulty: "Expert",
    shortDescription: "End-to-end applications demonstrating frontend, backend, and database integration.",
    longDescription: "This is your final project. Choose a problem domain you are passionate about and build a complete SaaS (Software as a Service) application from scratch. You will handle everything from UI/UX design to DevOps deployment.",
    technologies: ["React/Next.js", "Node/Go/Python", "PostgreSQL/MongoDB", "AWS/Docker", "CI/CD"],
    features: ["Complete authentication flow", "Subscription/Payment integration", "Automated testing (Unit/E2E)", "CI/CD Pipeline"],
    instructions: [
      "Draft a Product Requirements Document (PRD) and wireframes.",
      "Set up your repository with ESLint, Prettier, and GitHub Actions.",
      "Develop the backend API and frontend client iteratively.",
      "Write comprehensive tests.",
      "Deploy the application to a cloud provider using Docker."
    ],
    expectedOutput: "A fully functional, deployed SaaS application with a custom domain.",
    estimatedDuration: "80-120 hours",
    prerequisites: ["Proficiency in all stack layers", "System Design basics"],
    learningOutcomes: ["Software Development Lifecycle (SDLC)", "DevOps basics", "Product Management"]
  },
  {
    id: "team-agile-project",
    title: "Agile Team Project",
    category: "Capstone Projects",
    difficulty: "Expert",
    shortDescription: "Collaborative applications built using agile methodologies and version control.",
    longDescription: "Work in a team of 3-5 developers to build a large-scale application. The focus is not just on the code, but on communication, Git workflows, PR reviews, and Agile project management.",
    technologies: ["Git/GitHub", "Jira/Trello", "Full Stack Tech of Choice"],
    features: ["Sprint planning and execution", "Branching strategies (GitFlow)", "Code Review processes", "Conflict resolution"],
    instructions: [
      "Form a team and designate roles (Scrum Master, Lead Dev, etc).",
      "Break down the project into user stories and estimate story points.",
      "Execute 2-week sprints, holding daily standups.",
      "Use Pull Requests for every feature, requiring approvals before merging."
    ],
    expectedOutput: "A collaboratively built application and a well-documented Git history.",
    estimatedDuration: "4-6 weeks",
    prerequisites: ["Git collaboration", "Agile concepts"],
    learningOutcomes: ["Teamwork", "Agile/Scrum", "Advanced Git Workflows"]
  },
  {
    id: "portfolio-masterpiece",
    title: "Portfolio Masterpiece",
    category: "Capstone Projects",
    difficulty: "Expert",
    shortDescription: "Polished, production-ready projects designed to impress employers.",
    longDescription: "Refine one of your existing projects to an extreme level of polish. Focus on accessibility (a11y), performance optimization, SEO, flawless responsive design, and comprehensive documentation.",
    technologies: ["Lighthouse", "Jest/Cypress", "Web Vitals", "Accessibility Tools"],
    features: ["100/100 Lighthouse scores", "Keyboard navigability and screen reader support", "Sub-second load times", "Extensive README and architecture diagrams"],
    instructions: [
      "Audit your application using Chrome Lighthouse.",
      "Implement code splitting, image optimization, and caching strategies.",
      "Fix all accessibility violations.",
      "Write a technical blog post explaining the architecture and challenges overcome."
    ],
    expectedOutput: "An elite-tier application that stands out to senior engineers and hiring managers.",
    estimatedDuration: "30-50 hours",
    prerequisites: ["An existing completed project", "Understanding of Web Performance"],
    learningOutcomes: ["Web Performance Optimization", "Accessibility (a11y)", "Technical Writing"]
  }
];

async function main() {
  console.log("Seeding Project Templates...");
  
  for (const project of projectsData) {
    await prisma.projectTemplate.upsert({
      where: { id: project.id },
      update: {
        title: project.title,
        category: project.category,
        difficulty: project.difficulty,
        shortDescription: project.shortDescription,
        longDescription: project.longDescription,
        technologies: project.technologies,
        features: project.features,
        instructions: project.instructions,
        expectedOutput: project.expectedOutput,
        estimatedDuration: project.estimatedDuration,
        prerequisites: project.prerequisites,
        learningOutcomes: project.learningOutcomes,
      },
      create: {
        id: project.id,
        title: project.title,
        category: project.category,
        difficulty: project.difficulty,
        shortDescription: project.shortDescription,
        longDescription: project.longDescription,
        technologies: project.technologies,
        features: project.features,
        instructions: project.instructions,
        expectedOutput: project.expectedOutput,
        estimatedDuration: project.estimatedDuration,
        prerequisites: project.prerequisites,
        learningOutcomes: project.learningOutcomes,
      }
    });
  }
  
  console.log("Seeded", projectsData.length, "Project Templates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
