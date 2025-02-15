const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');
const natural = require('natural');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Enhanced training data
const admissionData = {
  queries: [
    {
      intent: "greetings",
      patterns: [
        "hi",
        "hello",
        "hey",
        "hai",
        "greetings",
        "good morning",
        "good afternoon",
        "good evening",
        "hi there",
        "hello there",
        "hey there",
        "hola",
        "namaste",
        "start",
        "begin",
        "help",
        "help me"
      ],
      responses: [
        "Hello! 👋 I'm your admission assistant. I can help you with:\n\n1. Admission Requirements\n2. Fee Structure\n3. Hostel Facilities\n4. Placements\n5. Course Information\n\nWhat would you like to know about?"
      ]
    },
    {
      intent: "goodbye",
      patterns: [
        "bye",
        "goodbye",
        "see you",
        "see you later",
        "thanks bye",
        "thank you bye",
        "ok bye",
        "bye bye",
        "tata",
        "cya",
        "good night",
        "exit",
        "end"
      ],
      responses: [
        "Thank you for your interest! If you have more questions, feel free to ask. Have a great day! 👋"
      ]
    },
    {
      intent: "thanks",
      patterns: [
        "thanks",
        "thank you",
        "thanks a lot",
        "thank you so much",
        "appreciated",
        "great help",
        "helpful",
        "thanks for helping",
        "thank you for assistance"
      ],
      responses: [
        "You're welcome! 😊 Is there anything else you'd like to know about our college?"
      ]
    },
    {
      intent: "admission_criteria",
      patterns: [
        "What are the eligibility criteria for B.Tech admission?",
        "What qualifications are needed for admission?",
        "Am I eligible for B.Tech admission?",
        "eligibility criteria",
        "admission requirements",
        "what marks do I need",
        "minimum percentage for btech",
        "12th marks required",
        "PCM percentage needed",
        "cutoff for admission",
        "can I get admission with 75%",
        "entrance exam cutoff",
        "admission eligibility check",
        "qualification criteria"
      ],
      responses: [
        "Eligibility Criteria for B.Tech Admission:\n\n1. Academic Requirements:\n   - Minimum 60% aggregate in PCM (Physics, Chemistry, Mathematics) in 12th\n   - No active backlogs from previous education\n\n2. Entrance Exam Requirements:\n   - Valid JEE Main score\n   - State-level entrance exam qualification\n\n3. Age Limit:\n   - Less than 25 years as of admission year\n\nNote: Reserved category candidates may have relaxed criteria. Contact admission office for specific details."
      ]
    },
    {
      intent: "fees_scholarships",
      patterns: [
        "What is the fee structure?",
        "How much are the fees?",
        "What is the course fee?",
        "Tell me about fees",
        "annual fee amount",
        "semester wise fees",
        "total course fee",
        "fee payment schedule",
        "scholarship details",
        "fee structure for btech",
        "how much to pay",
        "payment details",
        "merit scholarship",
        "financial aid",
        "education loan",
        "fee installments",
        "payment modes available",
        "tuition fee details"
      ],
      responses: [
        "Fee Structure and Scholarship Information:\n\n1. Academic Fees (Per Semester):\n   - Tuition Fee: ₹75,000\n   - Development Fee: ₹15,000\n   - Laboratory Fee: ₹10,000\n\n2. One-time Payments:\n   - Admission Fee: ₹25,000\n   - Security Deposit: ₹10,000 (Refundable)\n\n3. Scholarship Options:\n   - Merit-based scholarship (up to 50% tuition waiver)\n   - Need-based financial aid\n   - Sports quota scholarships\n   - Early bird discounts\n\n4. Payment Options:\n   - EMI available\n   - Education loan assistance\n   - Multiple payment modes accepted\n\nContact the finance office for detailed payment plans and scholarship eligibility."
      ]
    },
    {
      intent: "hostel_facilities",
      patterns: [
        "Is hostel facility available?",
        "Tell me about hostel",
        "Hostel accommodation details",
        "hostel fees",
        "room types available",
        "hostel facilities provided",
        "accommodation options",
        "hostel mess facility",
        "girls hostel details",
        "boys hostel information",
        "hostel rules",
        "room sharing options",
        "hostel amenities",
        "distance from college",
        "hostel security",
        "food facility in hostel",
        "hostel application process"
      ],
      responses: [
        "Hostel Facilities and Accommodation Details:\n\n1. Room Options:\n   - Single Occupancy: ₹1,50,000/year\n   - Double Sharing: ₹1,00,000/year\n   - Triple Sharing: ₹75,000/year\n\n2. Facilities Included:\n   - 24/7 Wi-Fi connectivity\n   - Air-conditioned rooms\n   - Attached bathrooms\n   - Study tables and cupboards\n   - Regular housekeeping\n\n3. Mess Facilities:\n   - Vegetarian and non-vegetarian options\n   - Three meals + evening snacks\n   - Hygienic kitchen\n   - Monthly menu rotation\n\n4. Security & Safety:\n   - 24/7 security guards\n   - CCTV surveillance\n   - Biometric entry\n   - Medical facility\n\nContact hostel warden for availability and booking details."
      ]
    },
    {
      intent: "placement_opportunities",
      patterns: [
        "What about placements?",
        "Tell me about job opportunities",
        "Placement details",
        "placement statistics",
        "companies visiting campus",
        "highest package offered",
        "average salary package",
        "placement record",
        "campus recruitment",
        "job guarantee",
        "placement cell activities",
        "recruitment process",
        "placement training",
        "company interviews",
        "placement preparation",
        "internship opportunities",
        "top recruiters list"
      ],
      responses: [
        "Placement Details and Career Opportunities:\n\n1. Placement Statistics (Last Year):\n   - Highest Package: ₹45 LPA\n   - Average Package: ₹8.5 LPA\n   - Placement Rate: 92%\n\n2. Top Recruiting Companies:\n   - Microsoft, Google, Amazon\n   - IBM, Infosys, TCS\n   - Goldman Sachs, Morgan Stanley\n   - Many more MNCs\n\n3. Placement Support:\n   - Pre-placement training\n   - Mock interviews\n   - Resume building workshops\n   - Soft skills development\n\n4. Industry Sectors:\n   - IT & Software\n   - Core Engineering\n   - Banking & Finance\n   - Consulting\n\nContact placement cell for detailed statistics and preparation guidelines."
      ]
    },
    {
      intent: "course_duration",
      patterns: [
        "how long is the course",
        "course duration",
        "program length",
        "years of study",
        "btech duration",
        "how many years",
        "time to complete",
        "semester duration",
        "total semesters",
        "course period",
        "study duration"
      ],
      responses: [
        "B.Tech Program Duration Details:\n\n1. Total Duration: 4 years\n2. Semesters: 8 (two per year)\n3. Each semester: ~6 months\n4. Optional: Additional 6 months internship\n\nNote: Lateral entry students can complete in 3 years starting from 2nd year."
      ]
    },
    {
      intent: "campus_facilities",
      patterns: [
        "what facilities are available",
        "campus facilities",
        "college infrastructure",
        "tell me about facilities",
        "what amenities",
        "campus amenities",
        "infrastructure details",
        "college facilities",
        "campus features",
        "available facilities"
      ],
      responses: [
        "Campus Facilities:\n\n1. Academic Facilities:\n   - Modern classrooms with projectors\n   - Well-equipped laboratories\n   - Central library\n   - Computer centers\n\n2. Sports Facilities:\n   - Indoor sports complex\n   - Outdoor sports grounds\n   - Gym and fitness center\n\n3. Other Amenities:\n   - Wi-Fi enabled campus\n   - Cafeteria\n   - Medical center\n   - Transport facility\n   - ATM & Bank branch\n\n4. Recreation:\n   - Student activity center\n   - Auditorium\n   - Music and art rooms"
      ]
    },
    {
      intent: "admission_process",
      patterns: [
        "how to apply",
        "admission process",
        "application procedure",
        "how to get admission",
        "steps for admission",
        "admission steps",
        "application process",
        "how do I apply",
        "what is the process",
        "admission procedure",
        "registration process",
        "how to register",
        "enrollment process"
      ],
      responses: [
        "Admission Process Steps:\n\n1. Online Application:\n   - Visit college website\n   - Fill application form\n   - Upload documents\n   - Pay application fee\n\n2. Document Verification:\n   - 10th & 12th marksheets\n   - Entrance exam scorecard\n   - ID proof\n   - Category certificate (if applicable)\n\n3. Selection Process:\n   - Merit list preparation\n   - Counseling rounds\n   - Seat allocation\n\n4. Admission Confirmation:\n   - Fee payment\n   - Document submission\n   - Orientation program\n\nFor assistance, contact admission helpline: +91-XXXXXXXXXX"
      ]
    },
    {
      intent: "available_branches",
      patterns: [
        "what branches are available",
        "which branches do you offer",
        "tell me about branches",
        "list of branches",
        "courses available",
        "btech branches",
        "engineering branches",
        "departments available",
        "streams offered",
        "specializations",
        "branch options",
        "course list",
        "what can i study",
        "available courses",
        "branch details",
        "which branch is best",
        "popular branches",
        "new branches",
        "branch information",
        "branch seats",
        "branch selection",
        "branch comparison",
        "branch scope",
        "branch placements",
        "branch fees",
        "branches and seats",
        "show all branches",
        "tell branches",
        "branch",
        "branches",
        "courses",
        "departments",
        "streams"
      ],
      responses: [
        "Available B.Tech Branches at our College:\n\n" +
        "1. Computer Science and Engineering (CSE)\n" +
        "   • Seats: 120\n" +
        "   • Specializations: AI/ML, Cybersecurity, Data Science\n" +
        "   • Average Package: 8.5 LPA\n\n" +
        "2. Information Technology (IT)\n" +
        "   • Seats: 60\n" +
        "   • Specializations: Cloud Computing, Web Technologies\n" +
        "   • Average Package: 8 LPA\n\n" +
        "3. Electronics & Communication (ECE)\n" +
        "   • Seats: 60\n" +
        "   • Specializations: VLSI, Embedded Systems\n" +
        "   • Average Package: 7 LPA\n\n" +
        "4. Electrical & Electronics (EEE)\n" +
        "   • Seats: 60\n" +
        "   • Specializations: Power Systems, Control Systems\n" +
        "   • Average Package: 6.5 LPA\n\n" +
        "5. Mechanical Engineering\n" +
        "   • Seats: 60\n" +
        "   • Specializations: CAD/CAM, Robotics\n" +
        "   • Average Package: 6 LPA\n\n" +
        "6. Civil Engineering\n" +
        "   • Seats: 60\n" +
        "   • Specializations: Structural, Transportation\n" +
        "   • Average Package: 5.5 LPA\n\n" +
        "7. Artificial Intelligence & Data Science\n" +
        "   • Seats: 60\n" +
        "   • Focus: ML, Big Data, Analytics\n" +
        "   • Average Package: 9 LPA\n\n" +
        "Note:\n" +
        "- All branches are NBA accredited\n" +
        "- Industry-aligned curriculum\n" +
        "- State-of-the-art laboratories\n" +
        "- Expert faculty members\n\n" +
        "For detailed information about any specific branch, please ask!"
      ]
    },
    {
      intent: "branch_details",
      patterns: [
        "tell me about cse",
        "what is it branch",
        "ece details",
        "mechanical engineering scope",
        "civil engineering information",
        "eee branch details",
        "ai ds branch",
        "cs branch",
        "it department",
        "mech branch",
        "civil dept",
        "computer science",
        "information technology",
        "electronics",
        "electrical",
        "mechanical",
        "civil",
        "artificial intelligence"
      ],
      responses: [
        "Please specify which branch you'd like to know more about:\n\n" +
        "1. CSE (Computer Science)\n" +
        "2. IT (Information Technology)\n" +
        "3. ECE (Electronics & Communication)\n" +
        "4. EEE (Electrical & Electronics)\n" +
        "5. Mechanical Engineering\n" +
        "6. Civil Engineering\n" +
        "7. AI & Data Science\n\n" +
        "You can ask about:\n" +
        "- Course curriculum\n" +
        "- Career opportunities\n" +
        "- Placement statistics\n" +
        "- Laboratory facilities\n" +
        "- Faculty expertise"
      ]
    }
  ]
};

// Enhanced keyword mapping
const directMatches = {
  'fees': 'fees_scholarships',
  'fee': 'fees_scholarships',
  'cost': 'fees_scholarships',
  'price': 'fees_scholarships',
  'payment': 'fees_scholarships',
  'scholarship': 'fees_scholarships',
  'hostel': 'hostel_facilities',
  'room': 'hostel_facilities',
  'accommodation': 'hostel_facilities',
  'stay': 'hostel_facilities',
  'placement': 'placement_opportunities',
  'job': 'placement_opportunities',
  'package': 'placement_opportunities',
  'salary': 'placement_opportunities',
  'career': 'placement_opportunities',
  'eligibility': 'admission_criteria',
  'criteria': 'admission_criteria',
  'requirement': 'admission_criteria',
  'qualify': 'admission_criteria',
  'cutoff': 'admission_criteria',
  'hi': 'greetings',
  'hello': 'greetings',
  'hey': 'greetings',
  'hai': 'greetings',
  'bye': 'goodbye',
  'thanks': 'thanks',
  'thank': 'thanks',
  'duration': 'course_duration',
  'years': 'course_duration',
  'facilities': 'campus_facilities',
  'amenities': 'campus_facilities',
  'infrastructure': 'campus_facilities',
  'apply': 'admission_process',
  'process': 'admission_process',
  'procedure': 'admission_process',
  'branch': 'available_branches',
  'branches': 'available_branches',
  'courses': 'available_branches',
  'departments': 'available_branches',
  'streams': 'available_branches',
  'cse': 'branch_details',
  'it': 'branch_details',
  'ece': 'branch_details',
  'eee': 'branch_details',
  'mech': 'branch_details',
  'civil': 'branch_details',
  'ai': 'branch_details'
};

// Enhanced typo corrections with more variations
const typoCorrections = {
  // Previous typos remain...
  // Additional variations:

  // Informal/Chat Style
  'wassup': 'hello',
  'sup': 'hello',
  'yo': 'hello',
  'hiya': 'hi',
  'howdy': 'hello',
  'xup': 'hello',
  'wtsup': 'hello',
  'wazzup': 'hello',
  'hru': 'how are you',
  'hw r u': 'how are you',
  'hwru': 'how are you',
  'k': 'ok',
  'kk': 'ok',
  'okk': 'ok',
  'okie': 'ok',
  'thx': 'thanks',
  'thnx': 'thanks',
  'thnks': 'thanks',
  'tysm': 'thank you so much',
  'tyvm': 'thank you very much',

  // Fees & Financial
  'scholrshp': 'scholarship',
  'schlrshp': 'scholarship',
  'skolarship': 'scholarship',
  'skolrship': 'scholarship',
  'finacial': 'financial',
  'financil': 'financial',
  'mony': 'money',
  'expences': 'expenses',
  'expnses': 'expenses',
  'discont': 'discount',
  'waiver': 'discount',
  'consession': 'concession',
  'consesion': 'concession',
  'installmnt': 'installment',
  'instalments': 'installments',
  'emi': 'installment',
  'semster': 'semester',
  'semister': 'semester',
  'sem': 'semester',

  // Admission Process
  'admisn process': 'admission process',
  'admishn procedure': 'admission procedure',
  'how 2 apply': 'how to apply',
  'how to join': 'how to apply',
  'registraton': 'registration',
  'registeration': 'registration',
  'regestration': 'registration',
  'rejistration': 'registration',
  'enroll': 'enrollment',
  'enrollmnt': 'enrollment',
  'enrolment': 'enrollment',
  'aplly': 'apply',
  'aply': 'apply',
  'applicatn': 'application',
  'applicasion': 'application',
  'documnt': 'document',
  'docmnt': 'document',
  'docs': 'documents',

  // Academic Related
  'syllabus': 'curriculum',
  'sylabus': 'syllabus',
  'syllbus': 'syllabus',
  'subjects': 'courses',
  'subjcts': 'subjects',
  'faculty': 'teachers',
  'faculties': 'teachers',
  'tchr': 'teacher',
  'lecturer': 'teacher',
  'prof': 'professor',
  'lab': 'laboratory',
  'libs': 'library',
  'libry': 'library',
  'librery': 'library',

  // Placement Related
  'highest pkg': 'highest package',
  'max package': 'highest package',
  'minimum pkg': 'lowest package',
  'min package': 'lowest package',
  'avg pkg': 'average package',
  'average sal': 'average salary',
  'companys': 'companies',
  'compnies': 'companies',
  'recruiters': 'companies',
  'recruitmnt': 'recruitment',
  'recuritment': 'recruitment',
  'placd': 'placed',
  'placed': 'placement',
  'internshp': 'internship',
  'intrship': 'internship',
  'intern': 'internship',

  // Hostel & Accommodation
  'mess': 'food',
  'food': 'mess',
  'messfee': 'mess fee',
  'foodfee': 'mess fee',
  'roomate': 'roommate',
  'rommmate': 'roommate',
  'rum': 'room',
  'sharing': 'shared',
  'single': 'individual',
  'seperate': 'separate',
  'seprate': 'separate',
  'washrum': 'washroom',
  'bathrm': 'bathroom',
  'toilets': 'bathroom',
  'wifi': 'internet',
  'net': 'internet',
  'hotwater': 'hot water',

  // Campus Life
  'cantin': 'canteen',
  'cantene': 'canteen',
  'cafe': 'cafeteria',
  'sports': 'games',
  'gym': 'gymnasium',
  'jimm': 'gym',
  'ground': 'playground',
  'auditorium': 'audi',
  'auditorum': 'auditorium',
  'lab': 'laboratory',
  'labs': 'laboratories',
  'busservice': 'transport',
  'transprt': 'transport',
  'bus': 'transport',
  'security': 'safety',
  'securty': 'security',
  'medical': 'hospital',
  'medicl': 'medical',
  'clinic': 'hospital',

  // Branch related typos
  'cse': 'computer science',
  'cs': 'computer science',
  'computr': 'computer',
  'cmptr': 'computer',
  'comp': 'computer',
  'it': 'information technology',
  'info': 'information',
  'tech': 'technology',
  'ece': 'electronics',
  'eee': 'electrical',
  'elec': 'electrical',
  'electron': 'electronics',
  'mech': 'mechanical',
  'mechnical': 'mechanical',
  'machanical': 'mechanical',
  'civil': 'civil engineering',
  'civl': 'civil',
  'ai': 'artificial intelligence',
  'artificial': 'ai',
  'ds': 'data science',
  'data': 'data science',
  'branch': 'branches',
  'brach': 'branch',
  'brnch': 'branch',
  'dept': 'department',
  'department': 'dept',
  'stream': 'branch',
  'course': 'branch'
};

// Add more patterns to existing intents
admissionData.queries.forEach(query => {
  if (query.intent === 'admission_criteria') {
    query.patterns.push(
      "wht r criteria",
      "criteria btch",
      "eligble 4 btech",
      "cn i get admisn",
      "admisn posible",
      "marks needed",
      "percentage reqd",
      "minimum marks",
      "12th cutoff",
      "jee rank needed",
      "entrance exam cutoff"
    );
  } else if (query.intent === 'fees_scholarships') {
    query.patterns.push(
      "total money required",
      "fee structure btch",
      "yearly expense",
      "semester fee",
      "scholarship available",
      "fee waiver",
      "financial aid",
      "education loan",
      "bank loan",
      "fee payment method",
      "installment facility"
    );
  }
  // ... Add more patterns for other intents
});

// Add Levenshtein distance function for fuzzy matching
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

// Add fuzzy matching function
function fuzzyMatch(str1, str2, threshold = 0.7) {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;
  return similarity >= threshold;
}

function findBestMatch(query) {
  const lowercaseQuery = query.toLowerCase().trim();
  const queryWords = lowercaseQuery.split(/\s+/);

  // Correct common typos in query
  const correctedQueryWords = queryWords.map(word => 
    typoCorrections[word] || word
  );
  const correctedQuery = correctedQueryWords.join(' ');

  // Check for direct matches with fuzzy matching
  for (const [keyword, intent] of Object.entries(directMatches)) {
    if (fuzzyMatch(correctedQuery, keyword, 0.8) || 
        queryWords.some(word => fuzzyMatch(word, keyword, 0.8))) {
      const matchedQuery = admissionData.queries.find(q => q.intent === intent);
      if (matchedQuery) {
        return matchedQuery.responses[0];
      }
    }
  }

  // Pattern matching with improved scoring and fuzzy matching
  let bestMatch = null;
  let highestScore = 0;

  for (const item of admissionData.queries) {
    for (const pattern of item.patterns) {
      const patternLower = pattern.toLowerCase();
      let score = 0;

      // Exact or fuzzy match
      if (fuzzyMatch(correctedQuery, patternLower, 0.9)) {
        score = 1;
      }
      // Contains match with fuzzy matching
      else if (patternLower.includes(correctedQuery) || 
               correctedQuery.includes(patternLower)) {
        score = 0.8;
      }
      // Word level fuzzy matching
      else {
        const patternWords = patternLower.split(/\s+/);
        const matchingWords = correctedQueryWords.filter(word =>
          patternWords.some(pWord => fuzzyMatch(word, pWord, 0.7))
        );
        score = matchingWords.length / Math.max(correctedQueryWords.length, patternWords.length);
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }
  }

  // Lower threshold for better matching with typos
  return highestScore > 0.3
    ? bestMatch.responses[0]
    : "I'm sorry, I couldn't understand your query. You can ask about:\n" +
      "- Admission requirements and process\n" +
      "- Fee structure and scholarships\n" +
      "- Hostel facilities\n" +
      "- Placement opportunities\n" +
      "- Campus facilities\n\n" +
      "Try asking your question in a different way.";
}

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('sendQuery', (query) => {
    setTimeout(() => {
      const response = findBestMatch(query);
      socket.emit('queryResponse', response);
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
const startServer = (port) => {
  server.listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${server.address().port}`);
    });
};

startServer(PORT);