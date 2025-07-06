import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, Target, Award, Users, CheckCircle, ArrowRight, MessageCircle, Play, Upload, Search, Filter, Moon, Sun, Sparkles, Star, TrendingUp } from 'lucide-react';

// Mock Claude API for development
if (!window.claude) {
  window.claude = {
    complete: async (prompt) => {
      const responses = [
        "Great question! When designing PCB layouts, always consider your signal integrity first. Keep high-speed traces short and avoid sharp angles.",
        "For power distribution, make sure to use adequate copper pour and place decoupling capacitors close to your ICs.",
        "Ground planes are crucial for EMI reduction. Try to maintain a solid ground plane and avoid splitting it unnecessarily.",
        "When routing differential pairs, maintain consistent spacing and length matching to preserve signal quality.",
        "Component placement is key - group related components together and consider thermal management for power components."
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };
}

const TraceTutorDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your PCB design tutor. What would you like to learn about today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLearningPath, setSelectedLearningPath] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const projects = [
    {
      id: 1,
      title: 'LED Blinker Circuit',
      difficulty: 'Beginner',
      description: 'Learn basic PCB layout with a simple LED blinker using a 555 timer',
      duration: '30 min',
      skills: ['Schematic Design', 'Basic Routing', 'Component Placement'],
      tags: ['led', 'timer', '555', 'beginner', 'basic', 'blinker'],
      icon: '💡'
    },
    {
      id: 2,
      title: 'Arduino Shield',
      difficulty: 'Intermediate',
      description: 'Design a custom Arduino shield with sensors and connectors',
      duration: '2 hours',
      skills: ['Multi-layer Design', 'Connector Design', 'Power Distribution'],
      tags: ['arduino', 'shield', 'sensors', 'connectors', 'microcontroller'],
      icon: '🔧'
    },
    {
      id: 3,
      title: 'Audio Amplifier',
      difficulty: 'Advanced',
      description: 'Create a high-quality audio amplifier with proper ground planes',
      duration: '4 hours',
      skills: ['Analog Design', 'EMI Considerations', 'Thermal Management'],
      tags: ['audio', 'amplifier', 'analog', 'ground planes', 'emi', 'thermal'],
      icon: '🎵'
    },
    {
      id: 4,
      title: 'Power Supply Module',
      difficulty: 'Intermediate',
      description: 'Design a switching power supply with proper isolation and filtering',
      duration: '3 hours',
      skills: ['Power Electronics', 'Isolation Design', 'Noise Filtering'],
      tags: ['power', 'supply', 'switching', 'isolation', 'filtering'],
      icon: '⚡'
    },
    {
      id: 5,
      title: 'IoT Sensor Board',
      difficulty: 'Intermediate',
      description: 'Create a wireless sensor board with WiFi connectivity and low power design',
      duration: '2.5 hours',
      skills: ['Wireless Design', 'Low Power', 'Sensor Integration'],
      tags: ['iot', 'sensor', 'wifi', 'wireless', 'low power', 'esp32'],
      icon: '📡'
    },
    {
      id: 6,
      title: 'Motor Controller',
      difficulty: 'Advanced',
      description: 'Design a high-current motor controller with proper heat dissipation',
      duration: '5 hours',
      skills: ['High Current Design', 'Thermal Management', 'Motor Control'],
      tags: ['motor', 'controller', 'high current', 'thermal', 'mosfet'],
      icon: '🏎️'
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: "Complete Beginner to PCB Designer",
      description: "Start from zero and build your way up to designing complex PCBs",
      duration: "8-12 weeks",
      difficulty: "Beginner to Advanced",
      projects: [1, 2, 3],
      milestones: [
        "Understand basic electronics and schematics",
        "Learn PCB layout fundamentals",
        "Master component placement and routing",
        "Design your first complete project"
      ],
      skills: ["Schematic Design", "PCB Layout", "Component Selection", "Manufacturing Prep"],
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      icon: '🚀'
    },
    {
      id: 2,
      title: "Power Electronics Specialist",
      description: "Focus on power supply design and high-current applications",
      duration: "6-8 weeks",
      difficulty: "Intermediate to Advanced",
      projects: [4, 6, 3],
      milestones: [
        "Design switching power supplies",
        "Master thermal management",
        "Handle high-current routing",
        "Implement safety and isolation"
      ],
      skills: ["Power Electronics", "Thermal Design", "High Current", "Safety Standards"],
      gradient: "from-orange-500 via-red-500 to-pink-500",
      icon: '⚡'
    },
    {
      id: 3,
      title: "IoT and Wireless Designer",
      description: "Specialize in connected devices and wireless communication",
      duration: "4-6 weeks",
      difficulty: "Intermediate",
      projects: [5, 2, 1],
      milestones: [
        "Design for wireless communication",
        "Optimize for low power consumption",
        "Integrate sensors and microcontrollers",
        "Handle EMI and antenna design"
      ],
      skills: ["Wireless Design", "Low Power", "Sensor Integration", "EMI Management"],
      gradient: "from-blue-500 via-purple-500 to-indigo-500",
      icon: '📶'
    }
  ];

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Log Groq API key for debugging
    console.log("KEY LOADED:", import.meta.env.VITE_GROQ_API_KEY);

    const newMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a helpful PCB design tutor." },
            { role: "user", content: userInput }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;

      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Groq fetch failed:", err);
      try {
        const text = await err?.response?.text?.();
        console.error("Groq error body:", text);
      } catch (parseErr) {
        console.error("Failed to parse Groq error:", parseErr);
      }
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops! Something went wrong with LLaMA. Check the browser console for error details.'
      }]);
    }

    setIsLoading(false);
  };

  const startProject = (project) => {
    setCurrentProject(project);
    setActiveTab('project');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || project.difficulty.toLowerCase() === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await window.claude.complete(`
        A student is searching for PCB design learning content with the query: "${searchQuery}"
        
        Based on this search, suggest a personalized learning path. Consider:
        - What skill level this suggests (beginner, intermediate, advanced)
        - What specific topics they should focus on
        - What order to learn things in
        - Any prerequisites they might need
        
        Keep the response concise and actionable, focusing on PCB design education.
      `);
      
      setChatMessages([
        { role: 'assistant', content: `Based on your search for "${searchQuery}", here's a personalized learning path:` },
        { role: 'assistant', content: response }
      ]);
      setActiveTab('tutor');
    } catch (error) {
      console.error('Error generating learning path:', error);
    }
  };

  const startLearningPath = (path) => {
    setSelectedLearningPath(path);
    setActiveTab('learning-path');
  };

  const showLearningPaths = () => {
    setActiveTab('learning-paths');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-xl border-b transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gray-900/70 border-gray-700/50' 
          : 'bg-white/70 border-gray-200/50'
      } shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              }`}>
                TraceTutor
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['Courses', 'Projects', 'Community'].map((item, index) => (
                <a 
                  key={item}
                  href="#" 
                  className={`font-medium transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-blue-400' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={() => setActiveTab('pricing')} 
                className={`font-medium transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Pricing
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-gray-800/50 text-yellow-400 hover:bg-gray-700/70 border border-gray-700/50' 
                    : 'bg-white/50 text-gray-600 hover:bg-white/70 border border-gray-200/50'
                } shadow-lg hover:shadow-xl`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <span className="relative">Get Started</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'learning-paths', label: 'Learning Paths' },
            { id: 'projects', label: 'Projects' },
            { id: 'tutor', label: 'AI Tutor' },
            { id: 'pricing', label: 'Pricing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/25'
                  : isDarkMode 
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-200 hover:bg-gray-700/70 hover:border-gray-600/50'
                    : 'bg-white/70 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white/90 hover:border-gray-300/50 hover:shadow-lg'
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 animate-pulse"></div>
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 transform ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-xl'
        } shadow-2xl p-8 mb-8`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          <div className="relative">
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>
              What do you want to learn today?
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search for topics like 'power supply', 'microcontroller', 'analog circuits'..."
                className={`flex-1 px-6 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg backdrop-blur-sm transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder-gray-400' 
                    : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                } shadow-lg hover:shadow-xl`}
              />
              <button
                onClick={handleSearchSubmit}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
              >
                <Search className="w-5 h-5" />
                Get Learning Path
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-16">
            <section className={`relative overflow-hidden text-center py-20 rounded-3xl transition-all duration-700 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/90 via-blue-900/90 to-purple-900/90 border border-gray-700/50 backdrop-blur-xl' 
                : 'bg-gradient-to-br from-white/90 via-blue-50/90 to-purple-50/90 border border-gray-200/50 backdrop-blur-xl'
            } shadow-2xl`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
              <div className="relative">
                <h2 className={`text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? 'from-white via-blue-200 to-purple-200' 
                    : 'from-gray-900 via-blue-600 to-purple-600'
                } leading-tight`}>
                  Learn PCB Design<br />Like a Pro
                </h2>
                <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-4xl mx-auto mb-12 leading-relaxed`}>
                  TraceTutor is your interactive guide to mastering printed circuit board design. 
                  From schematics to manufacturing, learn with real projects and AI-powered feedback.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3">
                    <Play className="w-6 h-6" />
                    Start Learning
                  </button>
                  <button 
                    className={`border px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${
                      isDarkMode 
                        ? 'border-gray-600/50 text-gray-300 hover:bg-gray-800/50' 
                        : 'border-gray-300/50 text-gray-700 hover:bg-white/50'
                    } shadow-lg hover:shadow-xl`}
                    onClick={showLearningPaths}
                  >
                    Watch Demo
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="text-center mb-16">
                <h3 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? 'from-white via-blue-200 to-purple-200' 
                    : 'from-gray-900 via-blue-600 to-purple-600'
                }`}>
                  Why Choose TraceTutor?
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: BookOpen, title: "Guided Learning", description: "Step by step tutorials that take you from beginner to advanced PCB designer with interactive challenges." },
                  { icon: Target, title: "Tool Agnostic", description: "Learn core principles that work with KiCad, Altium, Fusion 360, and other popular PCB design tools." },
                  { icon: CheckCircle, title: "Real Time Feedback", description: "Get instant feedback on your designs with AI-powered analysis for errors and improvements." },
                  { icon: Award, title: "Certifications", description: "Earn badges and certificates as you complete modules and master PCB design skills." },
                  { icon: Users, title: "Community", description: "Join thousands of learners, share projects, and get help from experienced designers." },
                  { icon: Zap, title: "Real Projects", description: "Work on practical projects from LED blinkers to complex microcontroller systems." }
                ].map((feature, index) => (
                  <div 
                    key={feature.title}
                    className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-sm'
                    } shadow-xl hover:shadow-2xl`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                          <div className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                          isDarkMode ? 'from-gray-100 to-gray-300' : 'from-gray-900 to-gray-700'
                        }`}>
                          {feature.title}
                        </h3>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'learning-paths' && (
          <div className="space-y-12">
            <div className="text-center">
              <h3 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              }`}>
                Choose Your Learning Path
              </h3>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-12`}>
                Select a structured learning journey designed to take you from where you are to where you want to be in PCB design.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningPaths.map((path) => (
                <div 
                  key={path.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm' 
                      : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-sm'
                  } shadow-xl hover:shadow-2xl`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="relative p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{path.icon}</div>
                        <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                          isDarkMode 
                            ? 'from-gray-100 to-gray-300' 
                            : 'from-gray-900 to-gray-700'
                        }`}>
                          {path.title}
                        </h3>
                      </div>
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                      {path.description}
                    </p>
                    <button 
                      onClick={() => startLearningPath(path)}
                      className={`group relative w-full bg-gradient-to-r ${path.gradient} text-white py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2`}
                    >
                      <Play className="w-4 h-4" />
                      Start Learning Path
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-12">
            <div className="text-center">
              <h3 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              }`}>
                Hands-On Projects
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm' 
                      : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-sm'
                  } shadow-xl hover:shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{project.icon}</div>
                        <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                          isDarkMode 
                            ? 'from-gray-100 to-gray-300' 
                            : 'from-gray-900 to-gray-700'
                        }`}>
                          {project.title}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                        project.difficulty === 'Beginner' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50' :
                        project.difficulty === 'Intermediate' ? 'bg-amber-100/80 text-amber-800 border border-amber-200/50' :
                        'bg-rose-100/80 text-rose-800 border border-rose-200/50'
                      }`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100/50 backdrop-blur-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                        ⏱️ {project.duration}
                      </span>
                      <button 
                        onClick={() => startProject(project)}
                        className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <Play className="w-4 h-4 relative" />
                        <span className="relative">Start Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="space-y-12">
            <div className="text-center">
              <h3 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              }`}>
                AI PCB Design Tutor
              </h3>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-12`}>
                Get personalized help and guidance from our AI tutor. Ask questions about PCB design, get feedback on your work, or request learning recommendations.
              </p>
            </div>
            
            <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-xl'
            } shadow-2xl`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
              <div className="relative">
                <div className="p-8 border-b border-gray-200/20">
                  <h4 className={`text-2xl font-bold flex items-center gap-3 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                      <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    Chat with Your Tutor
                  </h4>
                </div>
                
                <div className="h-96 p-8 overflow-y-auto space-y-6">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white transform hover:scale-105' 
                          : isDarkMode 
                            ? 'bg-gray-800/70 text-gray-100 border border-gray-700/50 hover:bg-gray-700/70' 
                            : 'bg-white/70 text-gray-900 border border-gray-200/50 hover:bg-white/90'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl backdrop-blur-sm ${
                        isDarkMode 
                          ? 'bg-gray-800/70 text-gray-100 border border-gray-700/50' 
                          : 'bg-white/70 text-gray-900 border border-gray-200/50'
                      } shadow-lg`}>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-8 border-t border-gray-200/20">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about PCB design, routing, components..."
                      className={`flex-1 px-6 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder-gray-400' 
                          : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                      } shadow-lg hover:shadow-xl`}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !userInput.trim()}
                      className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <ArrowRight className="w-5 h-5 relative" />
                      <span className="relative">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="text-center">
              <h3 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? 'from-white via-blue-200 to-purple-200' 
                  : 'from-gray-900 via-blue-600 to-purple-600'
              }`}>
                Choose Your Plan
              </h3>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-12`}>
                Start learning for free or unlock advanced features with our premium plans.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Basic Plan */}
              <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl' 
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-xl'
              } shadow-xl p-8`}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-50"></div>
                <div className="relative">
                  <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Basic</h4>
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">$0</span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>/month</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Access to basic courses",
                      "3 starter projects", 
                      "Community forum access",
                      "Limited AI tutor interactions"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border backdrop-blur-sm ${
                    isDarkMode 
                      ? 'border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50' 
                      : 'border-gray-300/50 text-gray-700 hover:bg-white/50 hover:border-gray-400/50'
                  } shadow-lg hover:shadow-xl`}>
                    Get Started Free
                  </button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-blue-500/50 backdrop-blur-xl' 
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-2 border-blue-500/50 backdrop-blur-xl'
              } shadow-2xl p-8`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
                <div className="relative">
                  <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Pro</h4>
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">$29</span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>/month</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "All courses and projects",
                      "Unlimited AI tutor access",
                      "Design review and feedback", 
                      "Priority community support",
                      "Certificate upon completion"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <span className="relative">Start Pro Plan</span>
                  </button>
                </div>
              </div>

              {/* Expert Plan */}
              <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl' 
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-xl'
              } shadow-xl p-8`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 opacity-50"></div>
                <div className="relative">
                  <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Expert</h4>
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">$99</span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>/month</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Pro",
                      "1-on-1 expert mentorship",
                      "Custom project guidance",
                      "Industry connections", 
                      "Job placement assistance"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border backdrop-blur-sm ${
                    isDarkMode 
                      ? 'border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50' 
                      : 'border-gray-300/50 text-gray-700 hover:bg-white/50 hover:border-gray-400/50'
                  } shadow-lg hover:shadow-xl`}>
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TraceTutorDemo;