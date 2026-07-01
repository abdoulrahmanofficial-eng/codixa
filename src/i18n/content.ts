import type { Course } from '../data/courses';

// ── Course Metadata ──────────────────────────────────────
export const courseMetaEn: Record<string, {
  title: string;
  description: string;
  level: string;
  ageRange: string;
  duration: string;
  skills: string[];
  prerequisites: string[];
}> = {
  scratch: {
    title: 'Scratch Programming for Kids',
    description: 'Start your coding journey with Scratch! Learn to create games and animations with drag-and-drop blocks',
    level: 'Beginner',
    ageRange: '7-12 years',
    duration: '4 Weeks',
    skills: ['Logical Thinking', 'Problem Solving', 'Creativity', 'Simple Algorithms'],
    prerequisites: [],
  },
  python: {
    title: 'Python Programming from Scratch',
    description: 'Learn Python, the most powerful and beginner-friendly programming language in the world',
    level: 'Beginner',
    ageRange: '10-16 years',
    duration: '12 Weeks',
    skills: ['Python Basics', 'Data Types', 'Functions', 'Loops & Conditions', 'OOP'],
    prerequisites: ['Basic computer skills'],
  },
  'html-css': {
    title: 'Web Design with HTML & CSS',
    description: 'Build beautiful websites from scratch! Learn HTML5 and CSS3 to create professional web pages',
    level: 'Beginner',
    ageRange: '10-16 years',
    duration: '8 Weeks',
    skills: ['HTML5', 'CSS3', 'Responsive Design', 'Flexbox & Grid', 'Animation'],
    prerequisites: ['Basic computer skills'],
  },
  javascript: {
    title: 'JavaScript: The Complete Language',
    description: 'Master JavaScript and turn your websites interactive. From basics to modern ES6+ features',
    level: 'Intermediate',
    ageRange: '12-18 years',
    duration: '14 Weeks',
    skills: ['JavaScript Basics', 'DOM Manipulation', 'ES6+', 'Async Programming', 'APIs'],
    prerequisites: ['HTML & CSS basics'],
  },
  'ai-basics': {
    title: 'Artificial Intelligence & Machine Learning',
    description: 'Explore the world of AI! Learn how machines think, learn, and make decisions',
    level: 'Advanced',
    ageRange: '14-18 years',
    duration: '12 Weeks',
    skills: ['AI Concepts', 'Machine Learning', 'Neural Networks', 'Data Analysis', 'Python'],
    prerequisites: ['Python basics', 'Basic math'],
  },
  react: {
    title: 'React.js: Build Modern Web Apps',
    description: 'Build fast, modern web applications with React.js - the most popular frontend framework',
    level: 'Advanced',
    ageRange: '14-18 years',
    duration: '10 Weeks',
    skills: ['React Basics', 'Components & Props', 'State Management', 'Hooks', 'Routing'],
    prerequisites: ['JavaScript intermediate', 'HTML & CSS'],
  },
};

// ── Chapter Titles ───────────────────────────────────────
export const chapterTitleEn: Record<string, string> = {
  'scratch-ch1': 'Welcome to Scratch World',
  'scratch-ch2': 'Motion & Control',
  'scratch-ch3': 'Looks & Sounds',
  'scratch-ch4': 'Game Development',
  'python-ch1': 'Welcome to Python',
  'python-ch2': 'Data & Variables',
  'python-ch3': 'Control Flow',
  'python-ch4': 'Functions & Modules',
  'python-ch5': 'Data Structures',
  'python-ch6': 'OOP & Advanced',
  'python-ch7': 'Real Projects',
  'python-ch8': 'Final Project',
  'html-css-ch1': 'Web Fundamentals',
  'html-css-ch2': 'HTML Structure',
  'html-css-ch3': 'CSS Styling',
  'html-css-ch4': 'CSS Layouts',
  'html-css-ch5': 'Advanced CSS',
  'html-css-ch6': 'Real Projects',
  'javascript-ch1': 'JS Basics',
  'javascript-ch2': 'Control & Loops',
  'javascript-ch3': 'Functions & Scope',
  'javascript-ch4': 'Data Collections',
  'javascript-ch5': 'DOM & Browser',
  'javascript-ch6': 'Modern JS',
  'javascript-ch7': 'Async & APIs',
  'javascript-ch8': 'Final Projects',
  'ai-basics-ch1': 'What is AI?',
  'ai-basics-ch2': 'How Machines Learn',
  'ai-basics-ch3': 'Supervised Learning',
  'ai-basics-ch4': 'Unsupervised Learning',
  'ai-basics-ch5': 'Neural Networks',
  'ai-basics-ch6': 'Natural Language',
  'ai-basics-ch7': 'Computer Vision',
  'ai-basics-ch8': 'AI Ethics & Future',
  'ai-basics-ch9': 'Build AI Projects',
  'react-ch1': 'React Fundamentals',
  'react-ch2': 'Components Deep Dive',
  'react-ch3': 'State & Events',
  'react-ch4': 'Hooks & Effects',
  'react-ch5': 'Routing & Data',
  'react-ch6': 'Final Project',
};

// ── Lesson Titles ────────────────────────────────────────
export const lessonTitleEn: Record<string, string> = {
  // Scratch
  'scratch-l1': 'What is Scratch?',
  'scratch-l2': 'Your First Project',
  'scratch-l3': 'Meet the Interface',
  'scratch-l4': 'Working with Sprites',
  'scratch-l5': 'Adding Backdrops',
  'scratch-l6': 'Motion Blocks',
  'scratch-l7': 'Moving Your Sprite',
  'scratch-l8': 'Control Blocks',
  'scratch-l9': 'Loops & Repetition',
  'scratch-l10': 'Conditional Logic',
  'scratch-l11': 'Looks Blocks',
  'scratch-l12': 'Costume Changes',
  'scratch-l13': 'Sound Blocks',
  'scratch-l14': 'Music & Effects',
  'scratch-l15': 'Variables in Scratch',
  'scratch-l16': 'My Blocks (Functions)',
  'scratch-l17': 'Design Your First Game',
  'scratch-l18': 'Add Scoring & Levels',
  'scratch-l19': 'Publish Your Project',
  'scratch-l20': 'Final Scratch Project',
  // Python
  'python-l1': 'What is Python?',
  'python-l2': 'Installing Python',
  'python-l3': 'Your First Program',
  'python-l4': 'Understanding the REPL',
  'python-l5': 'Comments & Code Style',
  'python-l6': 'Variables & Data Types',
  'python-l7': 'Strings',
  'python-l8': 'Numbers & Math',
  'python-l9': 'User Input',
  'python-l10': 'Type Conversion',
  'python-l11': 'If Statements',
  'python-l12': 'Comparison Operators',
  'python-l13': 'Logical Operators',
  'python-l14': 'While Loops',
  'python-l15': 'For Loops',
  'python-l16': 'Loop Control',
  'python-l17': 'Defining Functions',
  'python-l18': 'Function Parameters',
  'python-l19': 'Modules & Import',
  'python-l20': 'Built-in Modules',
  'python-l21': 'Lists',
  'python-l22': 'List Methods',
  'python-l23': 'Tuples & Sets',
  'python-l24': 'Dictionaries',
  'python-l25': 'List Comprehensions',
  'python-l26': 'Classes & Objects',
  'python-l27': 'Methods & Attributes',
  'python-l28': 'Inheritance',
  'python-l29': 'Error Handling',
  'python-l30': 'File I/O',
  'python-l31': 'Working with JSON',
  'python-l32': 'Virtual Environments',
  'python-l33': 'Basic Calculator',
  'python-l34': 'Guess the Number',
  'python-l35': 'To-Do List App',
  'python-l36': 'Weather App',
  'python-l37': 'Project Planning',
  'python-l38': 'Building the Project',
  'python-l39': 'Testing & Debugging',
  'python-l40': 'Project Submission',
  // HTML/CSS
  'html-css-l1': 'How the Web Works',
  'html-css-l2': 'What is HTML?',
  'html-css-l3': 'Setting Up Your Editor',
  'html-css-l4': 'Your First HTML Page',
  'html-css-l5': 'Understanding Tags',
  'html-css-l6': 'Headings & Paragraphs',
  'html-css-l7': 'Text Formatting',
  'html-css-l8': 'Links & Navigation',
  'html-css-l9': 'Images & Media',
  'html-css-l10': 'Lists & Tables',
  'html-css-l11': 'What is CSS?',
  'html-css-l12': 'Selectors & Properties',
  'html-css-l13': 'Colors & Backgrounds',
  'html-css-l14': 'Typography',
  'html-css-l15': 'The Box Model',
  'html-css-l16': 'Margins & Padding',
  'html-css-l17': 'Borders & Shadows',
  'html-css-l18': 'Display & Position',
  'html-css-l19': 'Flexbox',
  'html-css-l20': 'CSS Grid',
  'html-css-l21': 'Responsive Design',
  'html-css-l22': 'Media Queries',
  'html-css-l23': 'CSS Animations',
  'html-css-l24': 'Transitions & Transforms',
  'html-css-l25': 'CSS Variables',
  'html-css-l26': 'Portfolio Project 1',
  'html-css-l27': 'Portfolio Project 2',
  'html-css-l28': 'Landing Page 1',
  'html-css-l29': 'Landing Page 2',
  'html-css-l30': 'Final Web Project',
  // JavaScript (using existing lesson IDs from courses.ts)
  'javascript-l1': 'What is JavaScript?',
  'javascript-l2': 'JS in the Browser',
  'javascript-l3': 'Variables (var, let, const)',
  'javascript-l4': 'Data Types',
  'javascript-l5': 'Operators',
  'javascript-l6': 'If / Else Statements',
  'javascript-l7': 'Switch Statement',
  'javascript-l8': 'Ternary Operator',
  'javascript-l9': 'For Loop',
  'javascript-l10': 'While Loop',
  'javascript-l11': 'Functions',
  'javascript-l12': 'Arrow Functions',
  'javascript-l13': 'Scope & Hoisting',
  'javascript-l14': 'Closures',
  'javascript-l15': 'Arrays',
  'javascript-l16': 'Array Methods',
  'javascript-l17': 'Objects',
  'javascript-l18': 'Object Methods',
  'javascript-l19': 'What is the DOM?',
  'javascript-l20': 'Selecting Elements',
  'javascript-l21': 'Manipulating DOM',
  'javascript-l22': 'Events',
  'javascript-l23': 'Event Delegation',
  'javascript-l24': 'ES6+ Features',
  'javascript-l25': 'Destructuring',
  'javascript-l26': 'Spread & Rest',
  'javascript-l27': 'Template Literals',
  'javascript-l28': 'Modules',
  'javascript-l29': 'Callbacks',
  'javascript-l30': 'Promises',
  'javascript-l31': 'Async / Await',
  'javascript-l32': 'Fetch API',
  'javascript-l33': 'Error Handling',
  'javascript-l34': 'Local Storage',
  'javascript-l35': 'JSON & APIs',
  'javascript-l36': 'npm & Build Tools',
  'javascript-l37': 'Todo App',
  'javascript-l38': 'Weather App',
  'javascript-l39': 'Mini Game',
  'javascript-l40': 'Dashboard Project',
  // skipping 41-50 if they exist - check
  // AI Basics
  'ai-basics-l1': 'What is Intelligence?',
  'ai-basics-l2': 'History of AI',
  'ai-basics-l3': 'Types of AI',
  'ai-basics-l4': 'AI in Daily Life',
  'ai-basics-l5': 'AI Ethics Overview',
  'ai-basics-l6': 'What is Machine Learning?',
  'ai-basics-l7': 'Data: The Fuel of AI',
  'ai-basics-l8': 'Features & Labels',
  'ai-basics-l9': 'Training vs Testing',
  'ai-basics-l10': 'Overfitting & Underfitting',
  'ai-basics-l11': 'Linear Regression',
  'ai-basics-l12': 'Classification',
  'ai-basics-l13': 'Decision Trees',
  'ai-basics-l14': 'K-Nearest Neighbors',
  'ai-basics-l15': 'Evaluating Models',
  'ai-basics-l16': 'K-Means Clustering',
  'ai-basics-l17': 'Hierarchical Clustering',
  'ai-basics-l18': 'Dimensionality Reduction',
  'ai-basics-l19': 'Anomaly Detection',
  'ai-basics-l20': 'What are Neural Networks?',
  'ai-basics-l21': 'Perceptron',
  'ai-basics-l22': 'Multi-Layer Networks',
  'ai-basics-l23': 'Activation Functions',
  'ai-basics-l24': 'Backpropagation',
  'ai-basics-l25': 'CNNs',
  'ai-basics-l26': 'RNNs & LSTMs',
  'ai-basics-l27': 'Tokenization',
  'ai-basics-l28': 'Sentiment Analysis',
  'ai-basics-l29': 'Chatbots & NLU',
  'ai-basics-l30': 'Transformers & GPT',
  'ai-basics-l31': 'How Computers See',
  'ai-basics-l32': 'Image Classification',
  'ai-basics-l33': 'Object Detection',
  'ai-basics-l34': 'Facial Recognition',
  'ai-basics-l35': 'Bias in AI',
  'ai-basics-l36': 'AI & Jobs',
  'ai-basics-l37': 'Responsible AI',
  'ai-basics-l38': 'AI Project 1',
  'ai-basics-l39': 'AI Project 2',
  'ai-basics-l40': 'AI Project 3',
  // skipping 41-45
  // React
  'react-l1': 'What is React?',
  'react-l2': 'Setting Up React',
  'react-l3': 'JSX',
  'react-l4': 'Components',
  'react-l5': 'Props',
  'react-l6': 'Children & Composition',
  'react-l7': 'useState Hook',
  'react-l8': 'Event Handling',
  'react-l9': 'useEffect Hook',
  'react-l10': 'Custom Hooks',
  'react-l11': 'useContext',
  'react-l12': 'useReducer',
  'react-l13': 'React Router',
  'react-l14': 'Fetching Data',
  'react-l15': 'Project: Todo App',
  'react-l16': 'Project: Final App',
};

// ── Lesson Content (English) ─────────────────────────────
// Only translating the most visible first lessons of each course
export const lessonContentEn: Record<string, string> = {
  // Scratch Lesson 1
  'scratch-l1': `# What is Scratch? 🎮

Scratch is a visual programming language developed by MIT (Massachusetts Institute of Technology) specifically for kids and beginners.

## Why Scratch? 🌟

- **Easy to Learn**: Instead of writing complex commands, you drag and drop blocks like puzzles
- **Fun**: You can create games, animations, music, and interactive stories
- **Safe**: Kid-friendly environment
- **Huge Community**: Millions of shared projects online

## What Can You Build? 🚀

- 🎮 Games (platformers, puzzles, racing)
- 📖 Interactive stories
- 🎵 Music and art
- 📊 Educational simulations
- 🤖 Animated presentations

## The Scratch Philosophy 💡

"Imagine, Program, Share" - Scratch follows three simple steps:

1. **Imagine**: Think of an idea for your project
2. **Program**: Build it using Scratch blocks
3. **Share**: Share it with the world!`,

  // Python Lesson 1
  'python-l1': `# What is Python? 🐍

Python is one of the most popular and beginner-friendly programming languages in the world.

## Why Python? 🌟

- **Simple & Readable**: Python code looks like English
- **Versatile**: Used for web, AI, games, data science, and more
- **Huge Community**: Millions of developers and thousands of libraries
- **Beginners Love It**: The #1 language for first-time programmers

## Where is Python Used? 🚀

- **Web Development** (Instagram, YouTube use Python)
- **Artificial Intelligence** & Machine Learning
- **Data Science** & Analytics
- **Game Development**
- **Automation** (robots, scripts)
- **Scientific Research**

## Python in the Real World 🌍

- Google, Netflix, and NASA use Python
- It's the fastest-growing programming language
- Python developers are in high demand everywhere

Let's start your Python journey! 🚀`,

  // HTML/CSS Lesson 1
  'html-css-l1': `# How the Web Works 🌐

Before building websites, let's understand how the internet works.

## What Happens When You Visit a Website? 🌍

1. You type a URL (like google.com) in your browser
2. Your browser sends a request to a server
3. The server sends back HTML, CSS, and JavaScript files
4. Your browser renders these files into a beautiful webpage

## Frontend vs Backend 🏗️

- **Frontend**: What you see and interact with (HTML, CSS, JavaScript)
- **Backend**: Behind the scenes (servers, databases, APIs)

## What You'll Learn in This Course 📚

- **HTML**: Structure of web pages (headings, paragraphs, images)
- **CSS**: Styling and design (colors, layouts, animations)
- Together: Build professional, responsive websites!

Let's start building! 🚀`,

  // JavaScript Lesson 1
  'javascript-l1': `# What is JavaScript? ⚡

JavaScript (JS) is the programming language of the web. It makes websites interactive and dynamic.

## Why JavaScript? 🌟

- **The Language of the Web**: Runs in every browser
- **Interactive**: Makes buttons click, forms work, content update
- **Full Stack**: Can run on servers (Node.js), mobile apps, and desktops
- **Huge Ecosystem**: Millions of libraries and frameworks

## What Can JavaScript Do? 🚀

- **Dynamic Websites**: Update content without reloading
- **Games**: Browser games
- **Mobile Apps**: React Native
- **Desktop Apps**: Electron
- **Servers**: Node.js

## JS vs Python vs HTML/CSS 🤔

| Language | Purpose |
|----------|---------|
| HTML | Structure |
| CSS | Styling |
| JavaScript | Behavior & Logic |
| Python | Backend & Data |

Time to write your first JS code! ⚡`,

  // AI Basics Lesson 1
  'ai-basics-l1': `# What is Intelligence? 🤔

Before we understand Artificial Intelligence, we need to understand intelligence itself.

## What is Intelligence? 🧠

Intelligence is the ability to:
- **Learn** from experience
- **Reason** and solve problems
- **Adapt** to new situations
- **Understand** complex ideas

## Human Intelligence 🌟

- Can learn from just a few examples
- Understands context and emotions
- Creative and imaginative
- Self-aware

## What is Artificial Intelligence? 🤖

AI is when machines mimic human intelligence. They can:
- Recognize faces in photos
- Understand speech (Siri, Alexa)
- Play games (chess, Go)
- Drive cars
- Recommend movies (Netflix, YouTube)

## AI is Everywhere! 🌍

- 🎵 Spotify recommends songs using AI
- 📱 Face ID unlocks your phone
- 🗺️ Google Maps predicts traffic
- 🎬 Netflix suggests movies you might like

Let's explore the amazing world of AI! 🚀`,

  // React Lesson 1
  'react-l1': `# What is React? ⚛️

React is a JavaScript library for building user interfaces, created by Facebook (Meta).

## Why React? 🌟

- **Component-Based**: Build encapsulated components that manage their own state
- **Declarative**: Design views for each state, React updates efficiently
- **Popular**: Used by Facebook, Instagram, Netflix, Airbnb, and more
- **Huge Ecosystem**: Thousands of libraries and tools

## The Component Model 🏗️

Think of components as LEGO blocks:
- Each block is a reusable piece of UI
- Blocks can contain other blocks
- Blocks can be rearranged easily
- Each block manages its own look and feel

## Virtual DOM ⚡

React uses a Virtual DOM:
- Instead of changing the real DOM directly
- React updates a virtual representation
- Then efficiently updates only what changed
- Result: Blazing fast updates!

## React vs Other Frameworks 🤔

| Feature | React | Vue | Angular |
|---------|-------|-----|---------|
| Learning Curve | Moderate | Easy | Steep |
| Flexibility | High | Medium | Low |
| Popularity | Very High | High | Medium |

Let's build something awesome with React! 🚀`,
};

// ── Quiz Questions (English) ─────────────────────────────
export const quizEn: Record<string, {
  question: string;
  options: string[];
  explanation: string;
}[]> = {};

// ── Helpers ──────────────────────────────────────────────
export function useBilingualContent() {
  return {
    /** Get localized string */
    getT: (ar: string, en?: string) => (lang: string) =>
      lang === 'en' && en ? en : ar,

    /** Get localized course metadata */
    localizeCourse: (course: Course, lang: string): Course => {
      if (lang === 'ar') return course;
      const en = courseMetaEn[course.id];
      if (!en) return course;
      return {
        ...course,
        title: en.title,
        description: en.description,
        level: en.level as any,
        ageRange: en.ageRange,
        duration: en.duration,
        skills: en.skills,
        prerequisites: en.prerequisites,
        chapters: course.chapters.map(ch => ({
          ...ch,
          title: chapterTitleEn[ch.id] || ch.title,
          lessons: ch.lessons.map(l => ({
            ...l,
            title: lessonTitleEn[l.id] || l.title,
            content: lessonContentEn[l.id] || l.content,
            quiz: l.quiz?.map(q => {
              const eq = quizEn[l.id]?.[l.quiz!.indexOf(q)];
              return eq ? {
                ...q,
                question: eq.question,
                options: eq.options,
                explanation: eq.explanation,
              } : q;
            }),
          })),
        })),
      };
    },

    /** Localize all courses */
    localizeCourses: (coursesList: Course[], lang: string): Course[] =>
      coursesList.map(c => useBilingualContent().localizeCourse(c, lang)),
  };
}
