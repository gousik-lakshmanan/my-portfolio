/**
 * GOUSIK LAKSHMANAN - PORTFOLIO INTERACTIVITY ENGINE
 * Vanilla JavaScript (ES6+)
 * Implements Theme Switching, Intersection Observers, 3D Tilt,
 * Modals, Filtering, Photo Customizer, and Form Handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Theme Management (Light / Dark Mode with Persistence)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  // Retrieve saved preference or default to dark (developer futuristic aesthetic)
  const savedTheme = localStorage.getItem('gl_theme') || (prefersDarkScheme.matches ? 'dark' : 'dark');
  setTheme(savedTheme);

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gl_theme', theme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} theme`);
    });
  }

  // --------------------------------------------------------------------------
  // 2. Navbar Scrolling & Active Section Highlighting
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  }

  // Section Observer for Active Nav Link
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // --------------------------------------------------------------------------
  // 3. Technical Skills Interactive Category Filter
  // --------------------------------------------------------------------------
  const skillTabs = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. Interactive 3D Card Tilt Effect (Subtle, Modern)
  // --------------------------------------------------------------------------
  const tiltElements = document.querySelectorAll('.tilt-card');

  tiltElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // --------------------------------------------------------------------------
  // 5. Profile Picture Customizer & Persistent Cache
  // --------------------------------------------------------------------------
  const photoInput = document.getElementById('photo-input');
  const profileImg = document.getElementById('hero-profile-img');
  const profileSvgFallback = document.getElementById('profile-svg-fallback');
  const photoTriggerBtn = document.getElementById('photo-upload-trigger');

  // Load custom photo if previously set in localStorage
  const cachedPhoto = localStorage.getItem('gl_custom_photo');
  if (cachedPhoto && profileImg) {
    profileImg.src = cachedPhoto;
    profileImg.style.display = 'block';
    if (profileSvgFallback) profileSvgFallback.style.display = 'none';
  }

  if (photoTriggerBtn && photoInput) {
    photoTriggerBtn.addEventListener('click', () => {
      photoInput.click();
    });
  }

  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (profileImg) {
            profileImg.src = dataUrl;
            profileImg.style.display = 'block';
            if (profileSvgFallback) profileSvgFallback.style.display = 'none';
          }
          try {
            localStorage.setItem('gl_custom_photo', dataUrl);
            showToast('Profile photo updated & saved successfully!');
          } catch (err) {
            showToast('Photo displayed for this session');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Project Details Modal System
  // --------------------------------------------------------------------------
  const projectModalBackdrop = document.getElementById('project-modal-backdrop');
  const projectModalContent = document.getElementById('project-modal-content');
  const projectModalClose = document.getElementById('project-modal-close');
  const projectDetailTriggers = document.querySelectorAll('.project-detail-btn');

  const projectDetailsDatabase = {
    'hospital': {
      title: 'Hospital Management System',
      badge: '01 — Primary Featured Project',
      type: 'Full-Stack Web Application',
      customHTML: `
        <div style="margin-bottom: 24px;">
          <span class="section-tag" style="margin-bottom: 8px;">01 — Primary Featured Project</span>
          <h3 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">MediSync AI</h3>
          <h4 style="font-size: 1.2rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">Intelligent Integrated Hospital Management & Healthcare Assistance System</h4>
          <p style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-primary);">Full-Stack Web Application | Healthcare | AI | MERN Stack</p>
        </div>
        
        <div style="margin-bottom: 24px; line-height: 1.8; color: var(--text-muted); font-size: 1.05rem;">
          <p style="margin-bottom: 16px;">MediSync AI is a full-stack hospital management and healthcare assistance platform designed to connect essential hospital operations through a centralized, role-based system. It integrates patient management, appointments, room and bed allocation, pharmacy, blood bank, visitor management, billing, notifications, reports, and AI-powered healthcare assistance into a single platform.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Key Features</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Role-Based Hospital Management</strong> — Dedicated workflows for Administrators, Doctors, Nurses, Receptionists, Pharmacists, and Patients.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Patient Management</strong> — Centralized patient profiles, medical information, vitals, prescriptions, and healthcare records.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Appointment Management</strong> — Doctor and nurse appointment booking with department-based scheduling and status tracking.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Rooms & Beds</strong> — Real-time room and bed availability with controlled bed allocation and patient requests.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Pharmacy Management</strong> — Medicine inventory, stock monitoring, prescriptions, dispensing, expiry and low-stock tracking.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Blood Bank</strong> — Blood-group-wise inventory, donor management, blood requests, approvals, and stock tracking.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Visitor Management</strong> — Visitor registration, pass generation, check-in/check-out, and patient association.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Billing & Payments</strong> — Invoice generation, payment tracking, balance management, and payment history.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Diet Planning</strong> — Personalized diet planning based on physiological metrics, dietary preferences, allergies, activity level, and health conditions.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>AI Diet Planner</strong> — Gemini-powered personalized 7-day meal and exercise recommendations.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>AI Report Summarizer</strong> — Upload medical reports and receive AI-generated summaries, key findings, explanations, possible factors, prevention guidance, and questions to discuss with a healthcare professional.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Notifications & Reports</strong> — Role-specific notifications, operational reports, and data-driven dashboards.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Secure Authentication</strong> — JWT-based authentication with role-based access control and protected workflows.</span>
            </li>
          </ul>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="hospital-1.jpg" alt="MediSync AI Workflow" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">AI Healthcare</h4>
          
          <h5 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">AI Diet Planner</h5>
          <p style="margin-bottom: 16px; color: var(--text-muted); line-height: 1.6;">The AI Diet Planner processes user-provided physiological and dietary information through the Gemini API to generate a personalized response containing nutrition targets, a 7-day meal plan, exercise recommendations, health considerations, and safety guidance.</p>
          
          <h5 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">AI Report Summarizer</h5>
          <p style="color: var(--text-muted); line-height: 1.6;">Users can upload supported medical reports and have the report analyzed through Gemini. The system extracts relevant information and presents it in an easy-to-understand format, including a report overview, key findings, notable results, possible significance, general guidance, doctor-consultation points, and a medical disclaimer.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="hospital-2.jpg" alt="MediSync AI Features" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Technology Stack</h4>
          <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 16px;">
            <strong>Frontend:</strong> React.js, Vite, Tailwind CSS<br>
            <strong>Backend:</strong> Node.js, Express.js<br>
            <strong>Database:</strong> MongoDB, Mongoose<br>
            <strong>Authentication:</strong> JWT, bcrypt<br>
            <strong>AI:</strong> Google Gemini API<br>
            <strong>API Communication:</strong> REST APIs<br>
            <strong>Development:</strong> Git, GitHub
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">System Architecture</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            Users → Role-Based Frontend → Backend REST APIs → Hospital Management Modules → MongoDB → AI Services → Notifications & Analytics
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">My Contribution</h4>
          <p style="color: var(--text-muted); line-height: 1.6;">
            Designed and developed the full-stack MediSync AI platform, including role-based workflows, REST API integration, MongoDB data management, authentication and authorization, hospital operational modules, and AI-powered healthcare features.
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Project Highlights</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Centralized multiple hospital workflows into one platform.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented role-specific access and functionality.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built MongoDB-backed real-time operational data flows.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Integrated Gemini API for AI-powered healthcare assistance.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed AI responses to be understandable for non-technical users.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented validation, error handling, duplicate-submission protection, and secure API communication.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built the system with a scalable modular architecture for future healthcare features.</span>
            </li>
          </ul>
        </div>

        <div style="padding: 16px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Project:</strong> MediSync AI – Intelligent Integrated Hospital Management & Healthcare Assistance System</div>
          <div><strong>Repository:</strong> GitHub — <a href="https://github.com/gousik-lakshmanan/hospital-management-system" target="_blank" style="color: var(--accent-primary); text-decoration: none;">gousik-lakshmanan/hospital-management-system</a></div>
        </div>
      `
    },
    'payanam': {
      title: 'Payanam – AI Travel Planner',
      badge: '02 — Featured Full-Stack AI Project',
      type: 'AI-Powered Full-Stack Web Application',
      customHTML: `
        <div style="margin-bottom: 24px;">
          <span class="section-tag" style="margin-bottom: 8px;">02 — Featured Full-Stack AI Project</span>
          <h3 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">Payanam AI</h3>
          <h4 style="font-size: 1.2rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">Intelligent AI-Powered Travel Planning & Budget Management Platform</h4>
          <p style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-primary);">Full-Stack Web Application | Travel Technology | Generative AI | React</p>
        </div>
        
        <div style="margin-bottom: 24px; line-height: 1.8; color: var(--text-muted); font-size: 1.05rem;">
          <p style="margin-bottom: 16px;">Payanam AI is an AI-powered travel planning platform designed to help users create personalized and budget-conscious travel plans based on their trip requirements. Users can provide details such as destination, number of days, number of travelers, and available budget, and the system generates a structured day-by-day itinerary with activities, estimated expenses, and travel recommendations using the Gemini API.</p>
          <p style="margin-bottom: 16px;">The platform combines AI-generated travel planning with interactive maps, customizable activities, budget analysis, and travel reports to provide users with a centralized solution for planning and managing their trips.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Key Features</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>AI Trip Planning</strong> — Generates personalized travel itineraries based on destination, trip duration, number of travelers, and budget.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Day-by-Day Itinerary</strong> — Provides a structured list of activities and recommendations for each day of the trip.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>AI-Powered Recommendations</strong> — Uses the Gemini API to generate suitable activities and travel suggestions based on user-provided requirements.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Budget Planning</strong> — Structures the estimated trip expenses across major categories and compares the planned cost with the user's available budget.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Budget Analysis</strong> — Identifies when a planned trip exceeds the available budget and provides suggestions for managing or optimizing expenses.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Custom Activities</strong> — Users can add their own activities to the generated itinerary and customize their travel plan.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Interactive Maps</strong> — Integrates Google Maps to help users visualize destinations, activities, and travel locations.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Trip Management</strong> — Allows users to organize and review their generated travel plans in a structured format.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Travel Reports</strong> — Provides visual reports and summaries of trip planning and budget information.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Responsive Interface</strong> — Provides an interactive interface designed for convenient trip planning across different screen sizes.</span>
            </li>
          </ul>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="payanam-1.jpg" alt="Payanam AI Planner" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">AI Travel Planning</h4>
          
          <h5 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Gemini-Powered Itinerary Generation</h5>
          <p style="margin-bottom: 16px; color: var(--text-muted); line-height: 1.6;">Payanam AI uses the Gemini API to transform user requirements into a structured travel itinerary. Based on factors such as destination, number of days, number of travelers, and budget, the system generates recommended activities for each day along with travel and expense considerations.</p>
          
          <h5 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">AI Budget Assistance</h5>
          <p style="color: var(--text-muted); line-height: 1.6;">The system analyzes the estimated trip cost against the user's specified budget. When the planned expenses exceed the available budget, the application highlights the difference and provides AI-generated suggestions to help users optimize their itinerary and manage their spending.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="payanam-2.jpg" alt="Payanam AI Interface" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Travel Planning Workflow</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            User Input → Destination & Trip Details → Budget Analysis → Gemini AI Processing → Day-by-Day Itinerary → Activities & Expenses → Google Maps → Customization → Travel Reports
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Technology Stack</h4>
          <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 16px;">
            <strong>Frontend:</strong> React.js, Vite, React Router<br>
            <strong>UI & Icons:</strong> Lucide React, clsx<br>
            <strong>Data Visualization:</strong> Recharts<br>
            <strong>Utilities:</strong> date-fns, UUID<br>
            <strong>AI:</strong> Google Gemini API<br>
            <strong>Maps:</strong> Google Maps Integration<br>
            <strong>Backend:</strong> Node.js / Server-side APIs<br>
            <strong>API Communication:</strong> REST APIs
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">System Architecture</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            User Input → React Frontend → Travel Planning Services → Gemini AI → Itinerary & Budget Data → Google Maps → Reports & Visualization
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">My Contribution</h4>
          <p style="color: var(--text-muted); line-height: 1.6;">
            Designed and developed the Payanam AI travel planning platform, including the interactive travel-planning interface, user input workflows, AI-powered itinerary generation, budget analysis, activity management, Google Maps integration, and travel reporting features.
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Project Highlights</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built an AI-powered travel planning system around real-world user constraints.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Integrated Gemini API for personalized itinerary and activity generation.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Developed day-by-day travel planning based on trip duration and traveler requirements.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented budget estimation and expense analysis.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Added AI-assisted suggestions for managing trips that exceed the user's budget.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Integrated Google Maps to connect travel activities with geographic locations.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Enabled users to customize AI-generated itineraries by adding activities.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented visual travel reports using data-driven charts.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built a modular React/Vite architecture with reusable components and routing.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed the application to combine AI recommendations, travel planning, maps, and budget management in a single platform.</span>
            </li>
          </ul>
        </div>

        <div style="padding: 16px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Project:</strong> Payanam AI – Intelligent AI-Powered Travel Planning</div>
          <div style="margin-bottom: 8px;"><strong>Repository:</strong> GitHub — <a href="https://github.com/gousik-lakshmanan/payanam-updated-version?utm_source=chatgpt.com" target="_blank" style="color: var(--accent-primary); text-decoration: none;">gousik-lakshmanan/payanam-updated-version</a></div>
          <div><strong>Live Demo:</strong> <a href="https://payanam-frontend-1.onrender.com?utm_source=chatgpt.com" target="_blank" style="color: var(--accent-primary); text-decoration: none;">Payanam AI – Live Demo</a></div>
        </div>
      `
    },
    'visitor': {
      title: 'Visitor Management System',
      badge: '03 — Security & Operations Project',
      type: 'Full-Stack Web Application',
      customHTML: `
        <div style="margin-bottom: 24px;">
          <span class="section-tag" style="margin-bottom: 8px;">03 — Security & Operations Project</span>
          <h3 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">Visitor Management System</h3>
          <h4 style="font-size: 1.2rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">Intelligent QR-Based Visitor Registration & Security Management Platform</h4>
          <p style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-primary);">Full-Stack Web Application | Visitor Management | Security | MERN Stack</p>
        </div>
        
        <div style="margin-bottom: 24px; line-height: 1.8; color: var(--text-muted); font-size: 1.05rem;">
          <p style="margin-bottom: 16px;">Visitor Management System is a full-stack web application designed to digitize and streamline visitor entry and exit processes for companies and organizations. The platform connects administrators and security guards through a centralized system for visitor registration, QR-based verification, check-in/check-out tracking, employee management, company management, and visitor activity monitoring.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Key Features</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Role-Based Management</strong> — Dedicated workflows for Administrators and Security Guards with controlled access to system functionality.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Visitor Management</strong> — Register, update, search, and manage visitor information through a centralized platform.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>QR Code Generation</strong> — Automatically generates a unique QR code for registered visitors for quick identification and verification.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>QR-Based Check-In / Check-Out</strong> — Security guards and administrators can scan visitor QR codes to record entry and exit activities.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Visitor Logs</strong> — Maintains digital records of visitor check-in and check-out times for improved tracking and accountability.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Employee Management</strong> — Admin can add and manage employees associated with the organization.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Company Management</strong> — Admin can register and manage companies or organizations associated with visitors.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Security Guard Access</strong> — Provides security personnel with dedicated functionality for visitor verification and entry/exit management.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Visitor Search & Filtering</strong> — Quickly locate visitor records and review their activity history.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Dashboard & Monitoring</strong> — Provides centralized visibility into visitor activities and management operations.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Secure Authentication</strong> — JWT-based authentication with protected routes and role-based access control.</span>
            </li>
          </ul>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Visitor Management Workflow</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            Admin Registers Visitor → QR Code Generated → Visitor Arrives → QR Code Scanned → Check-In Recorded → Visitor Completes Visit → QR Code Scanned → Check-Out Recorded
          </p>
          <p style="margin-top: 16px; color: var(--text-muted); line-height: 1.6;">The workflow replaces traditional manual visitor registers with a digital process that provides a structured record of visitor activity and entry/exit history.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Technology Stack</h4>
          <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 16px;">
            <strong>Frontend:</strong> React.js, Vite, Tailwind CSS<br>
            <strong>Backend:</strong> Node.js, Express.js<br>
            <strong>Database:</strong> MongoDB, Mongoose<br>
            <strong>Authentication:</strong> JWT, bcrypt<br>
            <strong>API Communication:</strong> REST APIs, Axios<br>
            <strong>State Management:</strong> React Context API<br>
            <strong>Visualization:</strong> Chart.js<br>
            <strong>Additional:</strong> QR Code Generation & Scanning
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">System Architecture</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            Users → Role-Based Frontend → React Context → Backend REST APIs → Express Services → MongoDB → Visitor & Activity Records
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">My Contribution</h4>
          <p style="color: var(--text-muted); line-height: 1.6;">
            Designed and developed the full-stack Visitor Management System, including the React frontend, Node.js/Express backend, MongoDB database integration, authentication and authorization, visitor management workflows, QR-based verification, check-in/check-out functionality, employee and company management, and security guard operations.
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Project Highlights</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Digitized the traditional manual visitor registration process.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented QR-based visitor identification and verification.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built separate workflows for administrators and security guards.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Developed complete visitor check-in and check-out tracking.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented centralized visitor, employee, and company management.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Integrated MongoDB Atlas for persistent data storage.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Implemented JWT-based authentication and protected routes.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed a responsive interface for efficient day-to-day visitor management.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Built the application with a modular architecture that can be extended with additional security and visitor-management features.</span>
            </li>
          </ul>
        </div>

        <div style="padding: 16px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Project:</strong> Visitor Management System</div>
          <div style="margin-bottom: 8px;"><strong>Repository:</strong> GitHub — <a href="https://github.com/gousik-lakshmanan/visitor-management-system" target="_blank" style="color: var(--accent-primary); text-decoration: none;">gousik-lakshmanan/visitor-management-system</a></div>
          <div><strong>Live Demo:</strong> <a href="https://visitor-management-system-1-4zxf.onrender.com" target="_blank" style="color: var(--accent-primary); text-decoration: none;">visitor-management-system-1-4zxf.onrender.com</a></div>
        </div>
      `
    },
    'agriculture': {
      title: 'Smart Agriculture',
      badge: '04 — UI/UX Prototype',
      type: 'Figma UI/UX Prototype',
      customHTML: `
        <div style="margin-bottom: 24px;">
          <span class="section-tag" style="margin-bottom: 8px;">04 — UI/UX Prototype</span>
          <h3 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">Smart Agriculture - Farmer Support Platform</h3>
          <h4 style="font-size: 1.2rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">UI/UX Design for an Integrated Digital Platform for Farmers</h4>
          <p style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-primary);">UI/UX Design Project | Figma | Agriculture Technology | Farmer-Centric Design</p>
        </div>
        
        <div style="margin-bottom: 24px; line-height: 1.8; color: var(--text-muted); font-size: 1.05rem;">
          <p style="margin-bottom: 16px;">Farmer Support Platform is a UI/UX design concept created to provide farmers with a centralized digital platform for managing essential agricultural needs. The design focuses on simplifying access to crop selling, crop information, farming equipment, fertilizers, water resources, loans, and government schemes through an easy-to-use and farmer-friendly interface.</p>
          <p style="margin-bottom: 16px;">The platform also creates an opportunity for traders and agricultural businesses to collaborate with farmers and offer relevant products and services, creating a connected ecosystem between farmers, suppliers, and buyers.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Key Features</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Sell My Crops</strong> — Enables farmers to list and sell their crops at affordable and competitive prices by connecting them with potential buyers and traders.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Crop Study</strong> — Provides farmers with useful crop-related information to support better planning and informed agricultural decisions.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Equipment Requirements</strong> — Allows farmers to find necessary agricultural equipment and choose between buying or renting based on their requirements.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Buy Fertilizers</strong> — Provides access to fertilizers and agricultural products required for crop cultivation.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Need of Water</strong> — Helps farmers request and access water resources based on their agricultural requirements, with water quantity managed in units.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Loans & Government Schemes</strong> — Provides direct access to agricultural loan support and information about relevant government schemes and benefits.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Trader Collaboration</strong> — Enables traders and agricultural businesses to collaborate with the platform and offer products or services useful to farmers.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Farmer-Centric Navigation</strong> — Designed with simple navigation and clearly organized features to make essential agricultural services easier to discover and use.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold; margin-top: 2px;">▹</span>
              <span><strong>Integrated Agricultural Services</strong> — Brings multiple farming requirements together within a single digital platform.</span>
            </li>
          </ul>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="agriculture-1.jpg" alt="Smart Agriculture Features" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">User Flow</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            Farmer → Dashboard → Select Agricultural Requirement → Explore Service → Submit / Purchase / Request → Track Requirement
          </p>
          <p style="margin-top: 16px; color: var(--text-muted); line-height: 1.6;">The design organizes the major agricultural services into a centralized experience so that farmers do not need to depend on multiple disconnected platforms for their everyday requirements.</p>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Trader Collaboration</h4>
          <p style="color: var(--text-muted); line-height: 1.6;">The platform is also designed to support <strong>trader participation</strong>, allowing agricultural product sellers and businesses to collaborate with the platform. Traders can provide farming-related products, equipment, fertilizers, and other services, creating a marketplace-oriented ecosystem that connects farmers with relevant suppliers.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <img src="agriculture-2.jpg" alt="Smart Agriculture User Flow" style="width: 100%; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 16px;" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">UI/UX Design Process</h4>
          <p style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            Problem Identification → User Needs → Information Architecture → User Flow → Wireframing → UI Design → Interactive Prototype
          </p>
          <p style="margin-top: 16px; color: var(--text-muted); line-height: 1.6;">The design focuses on creating a simple, accessible, and task-oriented experience where farmers can quickly identify what they need and complete the corresponding action with minimal complexity.</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Design Focus</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Farmer-Centric Experience</strong> — Features are organized around real-world farming requirements.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Simple Navigation</strong> — Clear categories and straightforward user flows.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Accessible Information</strong> — Important agricultural services and support are presented in an organized manner.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Action-Oriented UI</strong> — Each feature guides users toward a clear action such as selling, buying, renting, requesting, or applying.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Connected Ecosystem</strong> — Designed to connect farmers, traders, agricultural suppliers, and support services.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span><strong>Responsive UI Concept</strong> — Designed with usability and consistency across different screen sizes in mind.</span>
            </li>
          </ul>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Design Tools</h4>
          <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 16px;">
            <strong>Design:</strong> Figma<br>
            <strong>Prototyping:</strong> Figma Interactive Prototyping<br>
            <strong>UI/UX:</strong> User Flows, Wireframing, Information Architecture, Visual Design
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">My Contribution</h4>
          <p style="color: var(--text-muted); line-height: 1.6;">
            Designed the complete UI/UX concept in Figma, including the information architecture, user flows, feature organization, interface layouts, interactive prototype, and farmer-focused experience. Designed the platform around key agricultural requirements such as crop selling, crop study, equipment procurement, fertilizers, water requirements, loans, government schemes, and trader collaboration.
          </p>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">Project Highlights</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed a centralized digital platform focused on farmers' day-to-day requirements.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Created dedicated workflows for crop selling and agricultural product access.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed equipment purchase and rental functionality.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Incorporated fertilizer purchasing into the farmer ecosystem.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Designed a unit-based water requirement and request concept.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Integrated agricultural loan and government scheme support into the platform.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Created a trader collaboration concept to connect suppliers with farmers.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Focused on simple, accessible, and task-oriented UX.</span>
            </li>
            <li style="display: flex; align-items: start; gap: 10px;">
              <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
              <span>Developed the complete UI/UX prototype using Figma.</span>
            </li>
          </ul>
        </div>

        <div style="padding: 16px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Project:</strong> Smart Agriculture - Farmer Support Platform</div>
          <div><strong>Figma Design:</strong> <a href="https://www.figma.com/design/dI2A1I5krNwhN5hwN8O7U2/Untitled?node-id=0-1&t=I1KDUFqSnO8hjRBX-1" target="_blank" style="color: var(--accent-primary); text-decoration: none;">View Farmer Support Platform – Figma</a></div>
        </div>
      `
    }
  };

  projectDetailTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsDatabase[projKey];
      if (data && projectModalContent && projectModalBackdrop) {
        if (data.customHTML) {
          projectModalContent.innerHTML = data.customHTML;
        } else {
          projectModalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
              <span class="section-tag" style="margin-bottom: 8px;">${data.badge}</span>
              <h3 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">${data.title}</h3>
              <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-primary);">${data.type}</p>
            </div>
            
            <div style="margin-bottom: 20px; line-height: 1.7; color: var(--text-muted); font-size: 1rem;">
              ${data.description}
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-main);">Key Highlights & Capabilities</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                ${data.features.map(f => `
                  <li style="display: flex; align-items: start; gap: 10px; font-size: 0.925rem; color: var(--text-muted);">
                    <span style="color: var(--accent-primary); font-weight: bold;">▹</span>
                    <span>${f}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 10px; color: var(--text-main);">Technology Stack</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.stack.map(s => `<span class="project-tag highlight">${s}</span>`).join('')}
              </div>
            </div>

            <div style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); font-size: 0.85rem; color: var(--text-subtle);">
              💡 <strong>Note:</strong> ${data.note}
            </div>
          `;
        }
        projectModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (projectModalClose && projectModalBackdrop) {
    projectModalClose.addEventListener('click', () => {
      projectModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    });

    projectModalBackdrop.addEventListener('click', (e) => {
      if (e.target === projectModalBackdrop) {
        projectModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Resume Viewer Modal & Instant Download Trigger
  // --------------------------------------------------------------------------
  const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
  const resumeModalClose = document.getElementById('resume-modal-close');
  const viewResumeBtns = document.querySelectorAll('.view-resume-trigger');
  const downloadResumeBtns = document.querySelectorAll('.download-resume-btn');

  viewResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (resumeModalBackdrop) {
        resumeModalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (resumeModalClose && resumeModalBackdrop) {
    resumeModalClose.addEventListener('click', () => {
      resumeModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    });

    resumeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === resumeModalBackdrop) {
        resumeModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Resume PDF Downloader
  downloadResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadResumePDF();
    });
  });

  function downloadResumePDF() {
    const a = document.createElement('a');
    a.href = './Gousik_L_Resume.pdf';
    a.download = 'Gousik_L_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded Gousik L Resume (PDF)');
  }

  // --------------------------------------------------------------------------
  // 8. Contact Form Client-Side Validation & Mailto Trigger
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim() || 'Portfolio Inquiry';
      const message = messageInput.value.trim();

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.textContent = 'Please fill in all required fields.';
          formStatus.className = 'form-status-msg error';
        }
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (formStatus) {
          formStatus.textContent = 'Please provide a valid email address.';
          formStatus.className = 'form-status-msg error';
        }
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Preparing Message...';
      submitBtn.disabled = true;

      // Prepare mailto link for direct sending without fake third-party servers
      const mailtoUrl = `mailto:gousik17@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Gousik,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      setTimeout(() => {
        if (formStatus) {
          formStatus.innerHTML = `Message drafted! Opening your email client to send to <strong>gousik17@gmail.com</strong>...`;
          formStatus.className = 'form-status-msg success';
        }
        showToast('Opening default email client...');
        window.location.href = mailtoUrl;

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
      }, 600);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary);">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Keyboard accessibility for ESC key to close active modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModalBackdrop && projectModalBackdrop.classList.contains('active')) {
        projectModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (resumeModalBackdrop && resumeModalBackdrop.classList.contains('active')) {
        resumeModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
});
