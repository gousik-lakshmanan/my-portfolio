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
      description: 'A comprehensive full-stack web application designed for healthcare facilities to streamline hospital operations, outpatient and inpatient appointments, resource scheduling, medical record access, and AI-powered healthcare assistance.',
      features: [
        'End-to-end appointment booking and physician availability scheduling',
        'Hospital operations and ward resource allocation workflows',
        'AI-powered clinical guidance and healthcare advisory module',
        'Role-based access security for administrators, doctors, and patients',
        'Real-time data synchronization and responsive clinical dashboard'
      ],
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'AI Assistance'],
      note: 'Source code and architectural review available upon request.'
    },
    'payanam': {
      title: 'Payanam – AI Travel Planner',
      badge: '02 — Featured Full-Stack AI Project',
      type: 'AI-Powered Full-Stack Web Application',
      description: 'An intelligent web application that automates personalized itinerary generation and trip scheduling based on traveler preferences, budget limits, duration, and geo-contextual recommendations.',
      features: [
        'AI-driven custom itinerary generation with day-by-day sequencing',
        'Interactive route planning and destination curation engine',
        'Travel budget estimation and personalized recommendation filters',
        'Responsive full-stack architecture with streamlined booking hooks'
      ],
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'AI API', 'Tailwind CSS'],
      note: 'Demonstrates modern full-stack web integration with generative intelligence.'
    },
    'visitor': {
      title: 'Visitor Management System',
      badge: '03 — Security & Operations Project',
      type: 'Full-Stack Web Application',
      description: 'A secure and streamlined web application engineered for visitor registration, automated dynamic QR code generation, check-in verification, and administrative visitor management.',
      features: [
        'Pre-registration and on-premise digital visitor check-in workflows',
        'Dynamic secure QR code generation for badge verification',
        'Host notification and arrival confirmation tracking',
        'Centralized audit log for facility security and compliance'
      ],
      stack: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'QR Engine'],
      note: 'Built to replace legacy paper logs with reliable digital security verification.'
    },
    'agriculture': {
      title: 'Smart Agriculture',
      badge: '04 — UI/UX Prototype',
      type: 'Figma UI/UX Prototype',
      description: 'Designed a high-fidelity Figma UI/UX prototype for an agricultural application that assists farmers with an intuitive, accessible interface tailored for field operations and crop monitoring.',
      features: [
        'Farmer-centric empathetic user experience with high-contrast accessibility',
        'Weather monitoring, soil condition indicators, and harvest alerts',
        'Simplified multilingual-friendly visual icons and interactive component library',
        'Iterative design system validated through usability walkthroughs'
      ],
      stack: ['Figma', 'UI/UX Design', 'Design Systems', 'Interactive Prototyping', 'User Research'],
      note: 'Dedicated Figma prototype emphasizing user-centered design and intuitive agricultural UX.'
    }
  };

  projectDetailTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsDatabase[projKey];
      if (data && projectModalContent && projectModalBackdrop) {
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

  // Dynamic Resume Downloader
  downloadResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      generateAndDownloadResume();
    });
  });

  function generateAndDownloadResume() {
    const resumeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Gousik_Lakshmanan_Resume</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; }
  h1 { font-size: 28px; margin: 0 0 4px 0; color: #0f172a; }
  .title { font-size: 16px; font-weight: 600; color: #0284c7; margin-bottom: 12px; }
  .contact { font-size: 13px; color: #475569; margin-bottom: 24px; border-bottom: 2px solid #0284c7; padding-bottom: 14px; }
  .contact a { color: #0284c7; text-decoration: none; margin-right: 14px; }
  h2 { font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 20px 0 10px 0; color: #0f172a; text-transform: uppercase; }
  p { margin: 6px 0; font-size: 14px; }
  ul { margin: 6px 0 12px 20px; padding: 0; font-size: 14px; }
  li { margin-bottom: 4px; }
  .item-head { display: flex; justify-content: space-between; font-weight: 600; }
  .date { color: #64748b; font-size: 13px; }
  @media print { body { margin: 0; padding: 15mm; } }
</style>
</head>
<body>
  <h1>GOUSIK L</h1>
  <div class="title">Full-Stack Developer | QA Analyst</div>
  <div class="contact">
    <span>📞 +91-6381053490</span> &nbsp;|&nbsp;
    <span>✉️ gousik17@gmail.com</span> &nbsp;|&nbsp;
    <a href="https://www.linkedin.com/in/gousik-l" target="_blank">LinkedIn: linkedin.com/in/gousik-l</a> &nbsp;|&nbsp;
    <a href="https://github.com/gousik-lakshmanan" target="_blank">GitHub: github.com/gousik-lakshmanan</a>
  </div>

  <h2>About Me</h2>
  <p>Passionate Full-Stack Developer and capable QA Analyst with hands-on experience in web development and software testing. Highly adaptable, quick to learn, and skilled in problem-solving and teamwork. Seeking internship or full-time opportunities to contribute and grow in the software industry.</p>

  <h2>Technical Skills</h2>
  <ul>
    <li><strong>Languages:</strong> HTML, CSS, JavaScript, Python</li>
    <li><strong>Frameworks:</strong> React.js, Node.js, Express.js, Tailwind CSS</li>
    <li><strong>Tools:</strong> Figma, MongoDB, Postman, Playwright, Google Sheets, GitHub, Jira</li>
  </ul>

  <h2>Experience</h2>
  <div class="item-head">
    <span>Front-End Developer &amp; Software Testing Intern &mdash; SNS iHub</span>
    <span class="date">4 Months</span>
  </div>
  <p style="font-size: 13.5px; color: #334155; margin-bottom: 12px;">Combined development and software testing internship, emphasizing front-end architecture, responsive component design, and systematic QA processes.</p>

  <div class="item-head">
    <span>Front-End Web Development Intern &mdash; Techvolt Software</span>
    <span class="date">21 Days</span>
  </div>
  <p style="font-size: 13.5px; color: #334155; margin-bottom: 12px;">Hands-on front-end web engineering focusing on modern web standards, UI styling, and responsive web development.</p>

  <h2>Projects</h2>
  <ul>
    <li><strong>Hospital Management System:</strong> Full-stack web application for managing hospital operations, appointments, resources, and AI-powered healthcare assistance.</li>
    <li><strong>Payanam – AI Travel Planner:</strong> AI-powered full-stack web application for personalized trip planning and itinerary generation.</li>
    <li><strong>Visitor Management System:</strong> Full-stack web application for visitor registration, QR code generation, and visitor management.</li>
    <li><strong>Smart Agriculture:</strong> Designed a Figma UI/UX prototype for an agricultural application that assists farmers with an intuitive interface.</li>
    <li><strong>Animation:</strong> Full-stack web application connecting freelancers with clients for project collaboration.</li>
  </ul>

  <h2>Education</h2>
  <div class="item-head">
    <span>B.E Computer Science and Design &mdash; SNS College of Engineering</span>
    <span class="date">2023 – 2027</span>
  </div>
  <div class="item-head" style="margin-top: 6px;">
    <span>HSC &mdash; K.V. Matric Higher Secondary School</span>
    <span class="date">2021 – 2023</span>
  </div>
  <div class="item-head" style="margin-top: 6px;">
    <span>SSLC &mdash; K.V. Matric Higher Secondary School</span>
    <span class="date">2020 – 2021</span>
  </div>

  <h2>Achievements</h2>
  <ul>
    <li>Selected for <strong>Smart India Hackathon (SIH) 2024 – Round 2</strong>.</li>
    <li>Won <strong>1 First Prize</strong> and <strong>2 Second Prizes</strong> in Paper Presentation competitions at Inter-College and National-Level Symposiums.</li>
    <li>Successfully completed the <strong>NPTEL Database Management Systems course with 68%</strong>.</li>
  </ul>

  <h2>Soft Skills</h2>
  <p>Problem Solving, Team Collaboration, Time Management, Adaptability</p>

  <h2>Languages</h2>
  <p>Tamil, English</p>
</body>
</html>`;

    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gousik_Lakshmanan_Resume.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded Gousik Lakshmanan Resume (HTML format)');
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
