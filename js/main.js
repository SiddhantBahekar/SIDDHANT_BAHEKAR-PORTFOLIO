/**
 * SIDDHANT SHAMKUMAR BAHEKAR - DIGITAL IDENTITY PORTFOLIO
 * Main JavaScript Engine: Particle Canvas, Terminal, Modals, Lightbox,
 * Filter Engine, Command Palette, Audio Synthesizer, 3D Tilt
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sound Synthesizer (Web Audio API) ---
  let soundEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiBeep(freq = 640, type = 'sine', duration = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioGain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      initAudio();
      soundToggleBtn.innerHTML = soundEnabled 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      soundToggleBtn.setAttribute('title', soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
      if (soundEnabled) playUiBeep(880, 'sine', 0.12);
    });
  }

  // --- 2. Interactive Neural Particle Canvas ---
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 1.8 + 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.55)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.22 * (1 - dist / 115)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // --- 3. Custom Cursor Follower ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorCircle = document.querySelector('.cursor-circle');

  if (cursorDot && cursorCircle && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      circleX += (mouseX - circleX) * 0.18;
      circleY += (mouseY - circleY) * 0.18;
      cursorCircle.style.left = `${circleX}px`;
      cursorCircle.style.top = `${circleY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const hoverTargets = document.querySelectorAll('a, button, .project-card, .certificate-card, .timeline-card, .skill-card, .social-pill, .terminal-chip');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorCircle.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorCircle.classList.remove('cursor-hover'));
    });
  }

  // --- 4. Dynamic Typewriter Headline ---
  const typingElement = document.querySelector('.typing-text');
  if (typingElement) {
    const roles = [
      'AI & Machine Learning Engineer',
      'Published Indian Patent Holder',
      'AI/ML Intern @ Maincrafts',
      'Full-Stack Developer (FastAPI + React)',
      'ServiceNow Certified System Specialist'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeLoop() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typeSpeed = 40;
      } else {
        typingElement.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typeSpeed = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        isDeleting = true;
        typeSpeed = 1600; // Pause at full word
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typeSpeed = 400; // Pause before typing new word
      }

      setTimeout(typeLoop, typeSpeed);
    }
    setTimeout(typeLoop, 800);
  }

  // --- 5. 3D Tilt Effect on Profile Hologram Card ---
  const profileCard = document.querySelector('.profile-card-3d');
  if (profileCard) {
    profileCard.addEventListener('mousemove', (e) => {
      const rect = profileCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      profileCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    profileCard.addEventListener('mouseleave', () => {
      profileCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }

  // --- 6. Multi-View Portal Router Engine ---
  const validViews = ['home', 'about', 'experience', 'education', 'skills', 'projects', 'patent', 'certificates', 'gallery', 'contact'];
  const viewPanels = document.querySelectorAll('.view-panel');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav-links .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links .mobile-nav-link');
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  // Mobile Drawer Elements
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');

  function openDrawer() {
    playUiBeep(600, 'sine', 0.08);
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  function switchView(targetViewId, updateUrl = true) {
    if (!targetViewId) targetViewId = 'home';
    let cleanId = targetViewId.toLowerCase().replace('#', '').trim();

    // Map common aliases
    if (cleanId === 'patent-section' || cleanId === 'achievements') cleanId = 'patent';
    if (cleanId === 'academic-performance' || cleanId === 'academics') cleanId = 'education';
    if (cleanId === 'certs' || cleanId === 'certification') cleanId = 'certificates';
    if (cleanId === 'work' || cleanId === 'internships') cleanId = 'experience';

    if (!validViews.includes(cleanId)) {
      cleanId = 'home';
    }

    const targetPanel = document.getElementById(`view-${cleanId}`);
    if (!targetPanel) return;

    // Toggle active panel with animation
    viewPanels.forEach(panel => {
      panel.classList.remove('active');
    });
    targetPanel.classList.add('active');

    // Update nav links active state
    desktopNavLinks.forEach(link => {
      const linkView = (link.getAttribute('data-target-view') || link.getAttribute('href') || '').replace('#', '');
      if (linkView === cleanId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileNavLinks.forEach(link => {
      const linkView = (link.getAttribute('data-target-view') || link.getAttribute('href') || '').replace('#', '');
      if (linkView === cleanId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash without scroll jumps
    if (updateUrl && window.location.hash !== `#${cleanId}`) {
      history.pushState(null, '', `#${cleanId}`);
    }

    // Scroll smoothly to top of the selected view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if currently open
    closeDrawer();

    // Audio feedback
    playUiBeep(620, 'sine', 0.06);
  }

  // Expose switchView globally for inline or modal triggers if needed
  window.switchView = switchView;

  // Handle all [data-target-view] clicks across the document
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-target-view]');
    if (trigger) {
      e.preventDefault();
      const targetView = trigger.getAttribute('data-target-view');
      switchView(targetView);
      return;
    }

    // Handle hash links pointing to view sections
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && !anchor.classList.contains('no-route')) {
        const targetId = href.replace('#view-', '').replace('#', '');
        if (validViews.includes(targetId)) {
          e.preventDefault();
          switchView(targetId);
        }
      }
    }
  });

  // Handle Enter keypress for keyboard-accessible portal cards
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const trigger = e.target.closest('[data-target-view]');
      if (trigger && (trigger.classList.contains('portal-card') || trigger.tagName === 'BUTTON')) {
        e.preventDefault();
        const targetView = trigger.getAttribute('data-target-view');
        switchView(targetView);
      }
    }
  });

  // Handle browser back/forward history navigation
  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '');
    switchView(currentHash || 'home', false);
  });

  // Initial Routing on Page Load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && validViews.includes(initialHash)) {
    switchView(initialHash, false);
  } else {
    switchView('home', false);
  }

  // Window scroll styling
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    if (navbar) {
      if (scrollPos > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (backToTopBtn) {
      if (scrollPos > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playUiBeep(700, 'sine', 0.1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 7. Theme Switcher (Dark Matrix vs Clean Contrast) ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      playUiBeep(520, 'sine', 0.1);
      const isLight = document.body.classList.contains('light-theme');
      themeToggleBtn.innerHTML = isLight
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    });
  }

  // --- 8. Interactive Terminal Engine (Updated with Exact Resume Info) ---
  const terminalInput = document.getElementById('terminal-cli-input');
  const terminalBody = document.getElementById('terminal-cli-body');
  const terminalChips = document.querySelectorAll('.terminal-chip');

  const commandResponses = {
    help: `Available Commands:
  • <span class="highlight">whoami</span>    : Overview of Siddhant Shamkumar Bahekar
  • <span class="highlight">skills</span>    : Languages, frameworks, tools & ML libraries
  • <span class="highlight">projects</span>  : Flagship AI & full-stack projects
  • <span class="highlight">patent</span>    : Published Government of India Patent details
  • <span class="highlight">education</span> : B.Tech CSE (AI/ML) @ SIT Nagpur
  • <span class="highlight">certs</span>     : Verified certifications (ServiceNow, Red Hat, etc.)
  • <span class="highlight">hire</span>      : Recruitment summary & contact details
  • <span class="highlight">clear</span>     : Wipe terminal console`,
    
    whoami: `<span class="success">Siddhant Shamkumar Bahekar</span>
B.Tech in Computer Science, Major in AI/ML (Aug 2024 – May 2028)
Symbiosis International University, Nagpur, Maharashtra
PRN: 24070521077 | Location: Nagpur, MH, India
LinkedIn: <span class="highlight">linkedin.com/in/siddhant-bahekar-7711a7315</span>
GitHub: <span class="highlight">GitHub.com/SiddhantBahekar</span>
Honors: Published Patent Co-Inventor & Top Performer IRP @ SIT Nagpur (2025–26).`,

    skills: `<span class="highlight">LANGUAGES</span>: Java, Python, SQL (Oracle), JavaScript, HTML/CSS
<span class="highlight">FRAMEWORKS</span>: React, Node.js, Express.js, Flask, FastAPI, PyTorch, TensorFlow / Keras, REST APIs, Linux
<span class="highlight">DEVELOPER TOOLS</span>: Git, Google Cloud Platform (GCP), VS Code, Visual Studio, Jupyter, Colab, Eclipse
<span class="highlight">ML LIBRARIES</span>: pandas, NumPy, Matplotlib, Scikit-learn, Seaborn, XGBoost`,

    projects: `1. <span class="amber">Time Series Forecasting using ARIMA & LSTM</span> (<span class="amber">Patent Published</span>)
   • Evaluated Google stock prices with RMSE of 3.76 and R² of 0.9599.
2. <span class="highlight">Stock Price Prediction Platform</span> (Python, FastAPI, React, yfinance)
   • 2-year market retrieval, 5–90-day forward forecasts, backtesting & React charts.
3. <span class="highlight">ExfilSentinel: Insider Data Exfiltration Detection</span> (FastAPI, React, MongoDB, XGBoost)
   • Privacy-preserving SOC telemetry, 3-model ML ensemble, 94.6% Accuracy, 90.9% F1.
4. <span class="highlight">CineAgent</span>: Autonomous AI Agent Movie Recommendation System (Gradio + Hybrid Scoring)
   • Academic Mini-Project AY 2026–2027 (Symbiosis Institute of Technology).`,

    patent: `<span class="amber">OFFICIAL PATENT PUBLICATION RECORD</span>
Title: A COMPUTER-IMPLEMENTED TIME-SERIES FORECASTING SYSTEM
Application No: 202521127184 A
Filing Date: 15/12/2025 | Publication Date: 02/01/2026
Journal: The Patent Office Journal No. 1/2026 Dated 02/01/2026, Page 385 (Issue 1/2026, Friday)
Applicant: Symbiosis International (Deemed University)
Co-Inventors: Dr. Deepak Suresh Asudani, Shubham Chakraborty, Siddhant Bahekar, Sumedh Yete
IPC: G06N 3/04, G06N 3/08, G06Q 10/04, G06N 20/00, G06N 3/0442
Scope: 12 Pages | 10 Claims`,

    education: `<span class="highlight">Symbiosis International University, Nagpur</span>
Bachelor of Technology in Computer Science, Major in AI/ML (Aug 2024 – May 2028)
<span class="highlight">Radha Junior College, Nagpur</span>
Higher Secondary Certificate (HSC) – Class XII, Science (PCM) (June 2022 – April 2024)`,

    certs: `• ServiceNow Virtual Internship Program & Micro-Certification (AICTE/SmartBridge)
• Red Hat System Administration I (RH124) - Verified on Credly
• AI/ML Intern @ Maincrafts Technology (Letter of Recommendation awarded)
• Python Programming Intern @ Kodbud (CLI & Security applications)
• Adobe University Hackathon & IBM SkillsBuild AI/ML`,

    hire: `<span class="success">READY FOR SUMMER 2027 INTERNSHIPS & RESEARCH ROLES!</span>
Email: bahekarsiddhant@gmail.com
Phone: +91 8010580569
LinkedIn: linkedin.com/in/siddhant-bahekar-7711a7315
GitHub: GitHub.com/SiddhantBahekar`
  };

  function executeTerminalCommand(cmdText) {
    const rawCmd = cmdText.trim().toLowerCase();
    playUiBeep(750, 'square', 0.05);

    if (rawCmd === 'clear') {
      terminalBody.innerHTML = `
        <div class="terminal-output">
          Terminal reset. Type <span class="highlight">'help'</span> for command index.
        </div>
      `;
      return;
    }

    // Append user input line
    const userRow = document.createElement('div');
    userRow.className = 'terminal-output';
    userRow.innerHTML = `<span class="terminal-prompt">siddhant@sit-nagpur:~$</span> <span class="highlight">${cmdText}</span>`;
    terminalBody.appendChild(userRow);

    // Support commands like 'open projects' or 'goto skills'
    let targetSection = null;
    const viewMapping = {
      'projects': 'projects',
      'project': 'projects',
      'skills': 'skills',
      'skill': 'skills',
      'patent': 'patent',
      'certs': 'certificates',
      'certificates': 'certificates',
      'education': 'education',
      'academics': 'education',
      'experience': 'experience',
      'internships': 'experience',
      'whoami': 'about',
      'about': 'about',
      'contact': 'contact',
      'hire': 'contact',
      'gallery': 'gallery',
      'home': 'home'
    };

    if (rawCmd.startsWith('open ') || rawCmd.startsWith('goto ') || rawCmd.startsWith('cd ')) {
      const param = rawCmd.split(' ')[1];
      if (param && viewMapping[param]) {
        targetSection = viewMapping[param];
      }
    }

    // Append response
    const respRow = document.createElement('div');
    respRow.className = 'terminal-output';
    if (targetSection) {
      respRow.innerHTML = `<span class="success">🚀 Opening full ${targetSection.toUpperCase()} section...</span>`;
      setTimeout(() => switchView(targetSection), 400);
    } else if (commandResponses[rawCmd]) {
      let output = commandResponses[rawCmd];
      if (viewMapping[rawCmd]) {
        output += `<div style="margin-top:10px;"><button type="button" class="btn-terminal-open" data-target-view="${viewMapping[rawCmd]}" style="color:var(--cyan-primary); text-decoration:underline; cursor:pointer; font-size:0.85rem; font-family:var(--font-mono); background:none; border:none; padding:0;">➔ Click here to open full ${viewMapping[rawCmd].toUpperCase()} view</button></div>`;
      }
      respRow.innerHTML = output;
    } else if (rawCmd === '') {
      // do nothing
    } else {
      respRow.innerHTML = `<span style="color:#ef4444">Command not recognized: '${cmdText}'. Type <span class="highlight">'help'</span> or <span class="highlight">'open [section]'</span>.</span>`;
    }
    terminalBody.appendChild(respRow);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        if (val.trim()) {
          executeTerminalCommand(val);
          terminalInput.value = '';
        }
      }
    });
  }

  terminalChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) {
        if (terminalInput) terminalInput.value = cmd;
        executeTerminalCommand(cmd);
      }
    });
  });

  // --- 9. Skills Category Tabs ---
  const skillTabs = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playUiBeep(620, 'sine', 0.08);
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      skillCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 10. Project Category Filter System ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playUiBeep(640, 'sine', 0.08);
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        if (filterVal === 'all' || card.getAttribute('data-category') === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 11. Project Architecture Detail Modal ---
  const projectModal = document.getElementById('project-detail-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const projectModalClose = document.getElementById('project-modal-close');

  const projectDetailsData = {
    stockcast: {
      title: "A Computer-Implemented Time-Series Forecasting System (Patent Published)",
      tagline: "Indian Patent Application No. 202521127184 A | Published 02/01/2026 in The Patent Office Journal No. 1/2026 (Page 385)",
      image: "assets/certificates/patent_publication_page_2.png",
      mentor: "Applicant: Symbiosis International (Deemed University) | Co-Inventors: Dr. Deepak Suresh Asudani, Shubham Chakraborty, Siddhant Bahekar, Sumedh Yete",
      problem: "Financial market time series exhibit high non-linearity, non-stationarity, and stochastic volatility that single statistical or simple neural models fail to forecast accurately.",
      architecture: [
        "<strong>Sequential Input Module (101, 201):</strong> Ingests multi-variate sequential financial temporal streams and structures timestamps.",
        "<strong>Data-Splitting & Preprocessing Modules (102, 202, 203):</strong> Normalizing, scaling, smoothing, differencing, and train/test dataset partitioning.",
        "<strong>Sliding-Window Dataset Creation (204):</strong> Generates supervised sequential matrices tailored for deep recurrent backpropagation.",
        "<strong>Hybrid ARIMA + LSTM Dual-Engine (103, 205, 104, 206):</strong> ARIMA determines optimal parameters (p, d, q) for stationary linear dynamics while LSTM recurrent units capture complex non-linear residual sequences.",
        "<strong>Prediction & Inverse-Transformation (105, 207, 208):</strong> Generates multi-step projections and maps forecasts back to original market scale.",
        "<strong>Error-Metrics Verification (107, 108, 209):</strong> Validates forecasting accuracy (achieved RMSE 3.76, R² 0.9599 on Google stock data) against ground truth telemetry."
      ],
      techStack: ["Python", "TensorFlow", "Keras", "Statsmodels", "ARIMA", "LSTM", "pandas", "NumPy", "IPC: G06N 3/04, G06Q 10/04"]
    },
    stockplatform: {
      title: "Stock Price Prediction Platform",
      tagline: "Full-Stack Market Analytics Platform with 5–90 Day Forward Predictions",
      image: "assets/projects/analytics_dashboard.png",
      mentor: "Full-Stack Machine Learning Architecture",
      problem: "Investors need actionable forward forecasts combined with rigorous backtesting rather than isolated black-box numeric predictions.",
      architecture: [
        "<strong>Data Ingestion Engine:</strong> Built with FastAPI to automatically ingest 2 years of financial stock data via yfinance.",
        "<strong>Multi-Model Predictive Suite:</strong> Generates 5–90-day forecasts using ARIMA, LSTM, Gradient Boosting, and ensemble models.",
        "<strong>Backtesting Engine:</strong> Evaluates performance with RMSE, MAE, MAPE, R², and directional accuracy.",
        "<strong>Interactive React UI:</strong> Dynamic charts visualizing historical prices, forecasts, market statistics, and prediction confidence intervals."
      ],
      techStack: ["Python", "FastAPI", "React", "Scikit-learn", "TensorFlow", "ARIMA", "yfinance", "REST APIs"]
    },
    exfilsentinel: {
      title: "ExfilSentinel: Insider Data Exfiltration Detection",
      tagline: "Privacy-Preserving SOC Telemetry Platform with 3-Model Machine Learning Ensemble",
      image: "assets/projects/sentinel_malware_hero.jpg",
      mentor: "Cybersecurity & Behavioral Analytics Project",
      problem: "Insider data theft bypasses perimeter firewalls, while full packet inspection invades employee privacy.",
      architecture: [
        "<strong>Privacy-Preserving Telemetry:</strong> Detects data exfiltration purely from behavioral telemetry without inspecting file contents.",
        "<strong>3-Model ML Ensemble:</strong> Combines Isolation Forest, Random Forest, and XGBoost to analyze 12 distinct metadata signals.",
        "<strong>Risk Scoring & Explainability:</strong> Generates 0–100 dynamic risk scores, classifies attack vectors, and provides explainable feature contributions.",
        "<strong>Real-Time SOC Automation:</strong> Delivers automated containment workflows, attack simulation, and endpoint monitoring; achieved <strong>94.6% accuracy and 90.9% F1 score</strong> with XGBoost on 1,000-sample holdout set."
      ],
      techStack: ["Python", "FastAPI", "React", "MongoDB", "Scikit-learn", "XGBoost", "Isolation Forest", "Random Forest"]
    },
    cineagent: {
      title: "CineAgent: AI Agent Movie Recommendation System",
      tagline: "Autonomous Agentic Architecture for Personalized Cinema Discovery",
      image: "assets/projects/cineagent_hero.jpg",
      mentor: "Symbiosis Institute of Technology (SIT), Nagpur",
      problem: "Traditional recommendation engines often operate as black boxes, lacking contextual mood adaptability, transparent explainability, and multi-faceted user preference routing.",
      architecture: [
        "<strong>AI Agent Decision Router:</strong> Evaluates natural-language user prompts and determines optimal search vectors (mood, genre, reference titles, or rating constraints).",
        "<strong>Content-Based Vectorization:</strong> Uses TF-IDF representation across comprehensive movie synopses and metadata catalogues.",
        "<strong>Cosine Similarity Engine:</strong> Computes angular distance between user preference vectors and film feature matrices for sub-millisecond ranking.",
        "<strong>Hybrid Scoring Algorithm:</strong> Balances pure text similarity with critical acclaim metrics (weighted IMDb ratings) to prevent low-quality niche recommendations.",
        "<strong>Cinema Radar & Mood/Vibe Explorer:</strong> Deployed as a high-performance Gradio graphical web dashboard for real-time interactive exploration."
      ],
      techStack: ["Python 3.13", "Gradio", "Scikit-Learn", "TF-IDF Vectorizer", "Cosine Similarity", "Pandas", "NumPy"]
    },
    vision: {
      title: "Two-Stage Deep Learning Object Detection in Images",
      tagline: "Region-Proposal Deep Learning for High-Precision Detection",
      image: "assets/projects/ml_roc_auc.png",
      mentor: "Deep Learning & Computer Vision Research Team",
      problem: "Single-stage detectors often struggle with overlapping small objects and dense bounding boxes in high-resolution multi-class scenarios.",
      architecture: [
        "<strong>Stage 1 (Region Proposal):</strong> Region Proposal Network (RPN) generates bounding box candidates with objectness scores.",
        "<strong>Stage 2 (Classification & Regression):</strong> Fast R-CNN pooling extracts feature maps for precise class label prediction and bounding-box regression.",
        "<strong>Training Pipeline:</strong> IoU threshold optimization and non-maximum suppression (NMS) for superior mAP precision."
      ],
      techStack: ["Python", "PyTorch", "Torchvision", "Faster R-CNN", "OpenCV", "NumPy"]
    }
  };

  window.openProjectModal = function(key) {
    const data = projectDetailsData[key];
    if (!data) return;
    playUiBeep(800, 'sine', 0.1);

    projectModalBody.innerHTML = `
      <img src="${data.image}" alt="${data.title}" class="modal-img-banner" />
      <span class="section-tag">${data.mentor}</span>
      <h2 style="font-size:1.8rem; color:#fff; margin-top:8px;">${data.title}</h2>
      <p style="color:var(--cyan-primary); font-weight:600; font-size:1.05rem; margin-bottom:16px;">${data.tagline}</p>
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:18px; margin-bottom:20px;">
        <h4 style="color:#fff; font-size:0.95rem; margin-bottom:6px;">🎯 Problem Statement</h4>
        <p style="font-size:0.9rem; color:var(--text-secondary);">${data.problem}</p>
      </div>

      <div style="margin-bottom:20px;">
        <h4 style="color:var(--cyan-primary); font-size:1.1rem; margin-bottom:12px;">⚙️ System Architecture & Workflow</h4>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:10px;">
          ${data.architecture.map(step => `<li style="font-size:0.9rem; color:var(--text-secondary); display:flex; gap:10px;"><span style="color:var(--emerald-primary);">✔</span> <div>${step}</div></li>`).join('')}
        </ul>
      </div>

      <div style="margin-top:20px;">
        <h4 style="color:#fff; font-size:0.95rem; margin-bottom:8px;">🛠️ Technologies Utilized</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${data.techStack.map(t => `<span class="project-tag" style="background:rgba(0,242,254,0.1); color:var(--cyan-primary); border-color:rgba(0,242,254,0.3);">${t}</span>`).join('')}
        </div>
      </div>
    `;

    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  if (projectModalClose) {
    projectModalClose.addEventListener('click', () => {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // --- 12. Fullscreen Lightbox Modal (Certificates & Gallery) ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  window.openLightbox = function(src, captionText) {
    playUiBeep(720, 'sine', 0.1);
    lightboxImg.src = src;
    lightboxCaption.textContent = captionText || '';
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // --- 13. Recruiter Mode (⚡ Executive Summary Modal) ---
  const recruiterModal = document.getElementById('executive-summary-modal');
  const recruiterOpenBtns = document.querySelectorAll('.open-recruiter-modal-btn');
  const recruiterCloseBtn = document.getElementById('recruiter-modal-close');

  function openRecruiterModal() {
    playUiBeep(880, 'sine', 0.12);
    recruiterModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeRecruiterModal() {
    recruiterModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  recruiterOpenBtns.forEach(btn => btn.addEventListener('click', openRecruiterModal));
  if (recruiterCloseBtn) recruiterCloseBtn.addEventListener('click', closeRecruiterModal);
  if (recruiterModal) {
    recruiterModal.addEventListener('click', (e) => {
      if (e.target === recruiterModal) closeRecruiterModal();
    });
  }

  // --- 14. Command Palette (Ctrl + K) ---
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdInput = document.getElementById('cmd-palette-input');
  const cmdResults = document.getElementById('cmd-palette-results');
  const searchTriggers = document.querySelectorAll('.search-trigger-btn');

  const paletteItems = [
    { title: 'Flagship: A Computer-Implemented Time-Series Forecasting System (ARIMA + LSTM)', view: 'projects', cat: 'Projects' },
    { title: 'Project: Stock Price Prediction Platform (FastAPI + React)', view: 'projects', cat: 'Projects' },
    { title: 'Project: ExfilSentinel Insider Data Exfiltration Detection', view: 'projects', cat: 'Projects' },
    { title: 'Project: CineAgent Movie Recommendation Engine', view: 'projects', cat: 'Projects' },
    { title: 'Experience: AI/ML Intern @ Maincrafts Technology', view: 'experience', cat: 'Experience' },
    { title: 'Experience: Python Programming Intern @ Kodbud', view: 'experience', cat: 'Experience' },
    { title: 'Experience: ServiceNow Virtual Intern (AICTE)', view: 'experience', cat: 'Experience' },
    { title: 'Official Indian Patent: A Computer-Implemented Time-Series Forecasting System (App #202521127184 A)', view: 'patent', cat: 'Patent & Honors' },
    { title: 'Verified Certifications (ServiceNow, Red Hat, Oracle, Coursera)', view: 'certificates', cat: 'Certifications' },
    { title: 'Education: Symbiosis International University, Nagpur (B.Tech CSE AI/ML)', view: 'education', cat: 'Education' },
    { title: 'Academic Performance & IRP Top Performer Honor', view: 'education', cat: 'Academics' },
    { title: 'Technical Skills Matrix (Python, Java, React, FastAPI, ML, AWS)', view: 'skills', cat: 'Skills' },
    { title: 'Photo Gallery: Academic & Professional Moments', view: 'gallery', cat: 'Gallery' },
    { title: 'Get In Touch / Contact Siddhant Shamkumar Bahekar', view: 'contact', cat: 'Contact' },
    { title: 'Home Overview Hub & Executive Summary', view: 'home', cat: 'Navigation' }
  ];

  function openCommandPalette() {
    playUiBeep(680, 'sine', 0.08);
    cmdModal.classList.add('active');
    cmdInput.value = '';
    renderPaletteResults(paletteItems);
    setTimeout(() => cmdInput.focus(), 50);
  }

  function closeCommandPalette() {
    cmdModal.classList.remove('active');
  }

  function renderPaletteResults(items) {
    cmdResults.innerHTML = '';
    if (items.length === 0) {
      cmdResults.innerHTML = `<div style="padding:16px; color:var(--text-muted); text-align:center;">No matching sections found.</div>`;
      return;
    }
    items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `cmd-item ${idx === 0 ? 'active' : ''}`;
      div.innerHTML = `
        <span style="font-weight:500;">${item.title}</span>
        <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cyan-primary);">${item.cat}</span>
      `;
      div.addEventListener('click', () => {
        closeCommandPalette();
        const targetView = item.view || (item.section ? item.section.replace('#', '') : 'home');
        switchView(targetView);
      });
      cmdResults.appendChild(div);
    });
  }

  searchTriggers.forEach(btn => btn.addEventListener('click', openCommandPalette));

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal.classList.contains('active')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeLightbox();
      closeRecruiterModal();
      if (projectModal) projectModal.classList.remove('active');
    }
  });

  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = paletteItems.filter(item => 
        item.title.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
      );
      renderPaletteResults(filtered);
    });
  }

  if (cmdModal) {
    cmdModal.addEventListener('click', (e) => {
      if (e.target === cmdModal) closeCommandPalette();
    });
  }

  // --- 15. Direct Message Delivery to bahekarsiddhant@gmail.com with Accurate IST Timestamp ---
  const contactForm = document.getElementById('portfolio-contact-form');
  const formAlert = document.getElementById('form-alert');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('btn-text');
  const formReplyTo = document.getElementById('form-replyto');
  const formSubjectHeader = document.getElementById('form-subject-header');
  const formTimeIST = document.getElementById('form-time-ist');
  const formTimeLocal = document.getElementById('form-time-local');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      playUiBeep(920, 'sine', 0.15);

      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const subject = document.getElementById('sender-subject').value.trim();
      const message = document.getElementById('sender-message').value.trim();

      // Field presence validation
      if (!name || !email || !message) {
        if (formAlert) {
          formAlert.className = 'form-alert error';
          formAlert.style.display = 'block';
          formAlert.innerHTML = '<strong>⚠️ Required Fields:</strong> Please enter your name, email address, and message.';
        }
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (formAlert) {
          formAlert.className = 'form-alert error';
          formAlert.style.display = 'block';
          formAlert.innerHTML = '<strong>⚠️ Invalid Email:</strong> Please enter a valid email address so Siddhant can reply directly to your inbox.';
        }
        return;
      }

      // Generate precise Indian Standard Time (IST, UTC+5:30) and Sender Local Time
      const now = new Date();
      const istTimeShort = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const istTimestamp = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ' (IST / India Standard Time)';

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const localTimestamp = now.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ` (${userTimezone})`;

      // UI Loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Delivering to bahekarsiddhant@gmail.com...";
      if (formAlert) {
        formAlert.className = 'form-alert';
        formAlert.style.display = 'block';
        formAlert.style.background = 'rgba(0, 242, 254, 0.1)';
        formAlert.style.border = '1px solid rgba(0, 242, 254, 0.3)';
        formAlert.style.color = 'var(--cyan-primary)';
        formAlert.innerHTML = `⏳ Sending your message and contact email (<strong>${email}</strong>) to Siddhant's inbox...`;
      }

      const emailSubject = `[${istTimeShort} IST] 📩 Message from ${name} (${email}): ${subject || 'Portfolio Inquiry'}`;

      // Update hidden fields
      if (formReplyTo) formReplyTo.value = email;
      if (formSubjectHeader) formSubjectHeader.value = emailSubject;
      if (formTimeIST) formTimeIST.value = istTimestamp;
      if (formTimeLocal) formTimeLocal.value = localTimestamp;

      // Payload with exact IST time in subject, table, and message body
      const payload = {
        "⏰ Indian_Standard_Time_IST": istTimestamp,
        "👤 Sender_Name": name,
        "✉️ Sender_Email": email,
        "📌 Subject": subject || 'Portfolio Inquiry',
        "🕒 Timezone_Clarification": "FormSubmit server footer displays UTC (-5:30 hrs behind India). Actual submission time is Indian Standard Time (IST) shown above.",
        _replyto: email,
        _subject: emailSubject,
        message: `=============================================================\nINCOMING PORTFOLIO CONTACT MESSAGE\n=============================================================\n\n⏰ TIME OF SUBMISSION (IST) : ${istTimestamp}\n🕒 SENDER DEVICE LOCAL TIME : ${localTimestamp}\n\n👤 SENDER'S NAME            : ${name}\n✉️ SENDER'S EMAIL           : ${email}\n📌 INQUIRY SUBJECT          : ${subject || 'Portfolio Inquiry'}\n\n-------------------- MESSAGE CONTENT ------------------------\n${message}\n\n-------------------------------------------------------------\n[Reply directly to this email in your inbox to contact ${name} at ${email}]\n\n* Note: Any footer below stating UTC time is FormSubmit's server clock.\nThe true submission time was: ${istTimestamp}\n=============================================================`,
        _template: "table",
        _captcha: "false"
      };

      try {
        let sentSuccessfully = false;

        // 1. Try Vercel Serverless Function first (/api/contact)
        try {
          const vResponse = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (vResponse.ok) {
            const vData = await vResponse.json();
            if (vData && (vData.success === true || vData.success === 'true')) {
              sentSuccessfully = true;
            }
          }
        } catch (vErr) {
          // Running on localhost/static server without /api/contact, proceed to fallback
        }

        // 2. Direct FormSubmit Fallback (works on static hosting and localhost)
        if (!sentSuccessfully) {
          const response = await fetch('https://formsubmit.co/ajax/bahekarsiddhant@gmail.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();
          if (response.ok || result.success === "true" || result.success === true) {
            sentSuccessfully = true;
          }
        }

        if (sentSuccessfully) {
          playUiBeep(1040, 'sine', 0.2);
          if (formAlert) {
            formAlert.className = 'form-alert success';
            formAlert.style.background = 'rgba(16, 185, 129, 0.15)';
            formAlert.style.border = '1px solid rgba(16, 185, 129, 0.4)';
            formAlert.style.color = '#34d399';
            formAlert.style.display = 'block';
            formAlert.innerHTML = `
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="font-size:1rem; font-weight:700;">✔ Delivered Directly to bahekarsiddhant@gmail.com!</div>
                <div>Thank you, <strong>${name}</strong>. Your message and reply-to email (<strong>${email}</strong>) have been delivered to Siddhant's inbox with timestamp: <em>${istTimestamp}</em>.</div>
              </div>
            `;
          }
          contactForm.reset();
        } else {
          throw new Error('Service returned non-success response');
        }
      } catch (err) {
        // Fallback: If network or adblocker restricts external AJAX, provide mailto with sender email & IST time
        console.warn('FormSubmit AJAX fallback:', err);
        const mailtoSubject = encodeURIComponent(`Portfolio Message from ${name} (${email}): ${subject || 'Inquiry'}`);
        const mailtoBody = encodeURIComponent(
          `Hi Siddhant,\n\nSender Email: ${email}\nSender Name: ${name}\nTime (IST): ${istTimestamp}\nSubject: ${subject || 'Portfolio Inquiry'}\n\nMessage:\n${message}\n\nBest regards,\n${name}\nEmail: ${email}`
        );
        const mailtoLink = `mailto:bahekarsiddhant@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

        if (formAlert) {
          formAlert.className = 'form-alert success';
          formAlert.style.display = 'block';
          formAlert.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div><strong>✔ Preparing direct delivery to bahekarsiddhant@gmail.com...</strong></div>
              <div>Opening your mail app with your message and sender email (<strong>${email}</strong>) pre-formatted.</div>
              <a href="${mailtoLink}" class="btn-primary" style="align-self:flex-start; padding:8px 16px; font-size:0.85rem; text-decoration:none; margin-top:4px;">
                Click here if email app didn't open automatically
              </a>
            </div>
          `;
        }

        setTimeout(() => {
          window.location.href = mailtoLink;
        }, 700);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Send Message to Siddhant's Inbox";
      }
    });
  }

  // --- 16. Real-time Visitor Telemetry Notification (IP Address & Location on Every Page Open) ---
  async function initVisitorTelemetry() {
    const visitCountKey = 'siddhant_portfolio_visit_counter';
    let visitCount = 1;
    try {
      const prevCount = parseInt(localStorage.getItem(visitCountKey) || '0', 10);
      visitCount = prevCount + 1;
      localStorage.setItem(visitCountKey, visitCount.toString());
    } catch (e) {
      visitCount = 1;
    }

    try {
      let visitor = null;

      // Primary Geolocation Probe: ipwho.is (fast, CORS-enabled, rich location)
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data && data.success) {
          visitor = data;
        }
      } catch (e1) {
        // Fallback Geolocation Probe: ipapi.co
        try {
          const res2 = await fetch('https://ipapi.co/json/');
          visitor = await res2.json();
        } catch (e2) {}
      }

      if (!visitor || (!visitor.ip && !visitor.query)) return;

      const ip = visitor.ip || visitor.query || 'Unknown IP';
      const city = visitor.city || 'Unknown City';
      const region = visitor.region || visitor.region_name || '';
      const country = visitor.country || visitor.country_name || 'Unknown Country';
      const postal = visitor.postal || visitor.zip || '';
      const isp = (visitor.connection && visitor.connection.isp) || visitor.org || visitor.isp || 'Internet Provider';
      const tz = (visitor.timezone && visitor.timezone.id) || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      // Accurate Indian Standard Time (IST)
      const now = new Date();
      const visitTimeIST = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ' (IST / India Standard Time)';

      const visitorLocalTime = now.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ` (${tz})`;

      // Device & Browser Details
      const ua = navigator.userAgent;
      let browserName = 'Web Browser';
      if (ua.includes('Edg/')) browserName = 'Microsoft Edge';
      else if (ua.includes('Chrome')) browserName = 'Google Chrome';
      else if (ua.includes('Firefox')) browserName = 'Mozilla Firefox';
      else if (ua.includes('Safari')) browserName = 'Apple Safari';

      let osName = 'Desktop';
      if (ua.includes('Windows')) osName = 'Windows';
      else if (ua.includes('Macintosh')) osName = 'macOS';
      else if (ua.includes('Android')) osName = 'Android Mobile';
      else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS Device';
      else if (ua.includes('Linux')) osName = 'Linux';

      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const referrer = document.referrer ? document.referrer : 'Direct Visit / Typed URL';
      const currentUrl = window.location.href;

      const istTimeShort = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const telemetryPayload = {
        "🔄 Visit_Number": `#${visitCount}`,
        "⏰ Visit_Time_IST": visitTimeIST,
        "📍 Visitor_IP": ip,
        "🌍 Geolocation": `${city}, ${region ? region + ', ' : ''}${country}${postal ? ' (' + postal + ')' : ''}`,
        "🏢 ISP_Carrier": isp,
        "🕒 Notice_On_Time": "Server footer below shows UTC time (-5:30 hrs behind India). Actual visit time was " + visitTimeIST,
        _subject: `[${istTimeShort} IST] 👁️ Visitor Alert (Visit #${visitCount}): Portfolio Opened from ${city}, ${country} [${ip}]`,
        Visitor_IP_Address: ip,
        Location: `${city}, ${region ? region + ', ' : ''}${country}${postal ? ' (' + postal + ')' : ''}`,
        Operating_System: osName,
        Browser: browserName,
        Screen_Resolution: screenRes,
        Page_URL: currentUrl,
        Traffic_Referrer: referrer,
        message: `=============================================================\nNEW PORTFOLIO VISITOR ALERT (VISIT #${visitCount})\n=============================================================\n\nA user has opened your digital portfolio website!\n\n🔄 VISIT INSTANCE        : Visit #${visitCount} from this visitor\n📍 VISITOR IP ADDRESS    : ${ip}\n🌍 GEOGRAPHIC LOCATION   : ${city}, ${region ? region + ', ' : ''}${country}${postal ? ' (' + postal + ')' : ''}\n🏢 INTERNET PROVIDER/ISP : ${isp}\n⏰ VISIT TIME (IST)      : ${visitTimeIST}\n🕒 VISITOR LOCAL TIME    : ${visitorLocalTime}\n💻 OS & BROWSER          : ${osName} • ${browserName}\n🖥️ SCREEN RESOLUTION     : ${screenRes}\n🔗 PAGE OPENED           : ${currentUrl}\n🌐 TRAFFIC SOURCE        : ${referrer}\n\n* Note: Any footer below stating UTC time is FormSubmit's server clock.\nThe true visit time was: ${visitTimeIST}\n=============================================================`,
        _template: "table",
        _captcha: "false"
      };

      // Transmit background telemetry alert to bahekarsiddhant@gmail.com
      // 1. Try Vercel Serverless Function first (/api/visitor)
      let vercelDispatched = false;
      try {
        const vRes = await fetch('/api/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(telemetryPayload)
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData && (vData.success === true || vData.success === 'true')) {
            vercelDispatched = true;
          }
        }
      } catch (vErr) {
        // If not running on Vercel, proceed to client-side fallback
      }

      // 2. Direct client-side FormSubmit fallback
      if (!vercelDispatched) {
        await fetch('https://formsubmit.co/ajax/bahekarsiddhant@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(telemetryPayload)
        });
      }

      // Successfully dispatched visit notification
    } catch (err) {
      // Telemetry error suppressed silently to ensure zero impact on user experience
      console.debug('Telemetry notice:', err);
    }
  }

  // Launch visitor telemetry after page initial rendering
  setTimeout(initVisitorTelemetry, 1500);
});
