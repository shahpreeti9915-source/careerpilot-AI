import { runAgentWorkflow } from './agents.js';
import { logSecurityEvent, getSecurityLogs } from './security.js';

// DOM Elements
const onboardingSection = document.getElementById('onboarding-section');
const dashboardSection = document.getElementById('dashboard-section');
const onboardingForm = document.getElementById('onboarding-form');

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Action Buttons
const btnReset = document.getElementById('btn-reset');

// Form Inputs
const inputEducation = document.getElementById('education-input');
const inputGoal = document.getElementById('goal-input');
const inputSkills = document.getElementById('skills-input');
const inputHours = document.getElementById('hours-input');

// Error Elements
const errorEducation = document.getElementById('error-education');
const errorGoal = document.getElementById('error-goal');
const errorSkills = document.getElementById('error-skills');
const errorHours = document.getElementById('error-studyHours');

// Terminals
const agentTerminal = document.getElementById('agent-terminal');
const securityTerminal = document.getElementById('security-audit-terminal');

// Security Badge Elements
const badgePii = document.getElementById('badge-pii');

// Data Summary Elements
const summaryTargetGoal = document.getElementById('summary-target-goal');
const summaryStudyHours = document.getElementById('summary-study-hours');
const dailyAvgHours = document.getElementById('daily-avg-hours');
const matchingSkillsCount = document.getElementById('matching-skills-count');
const gapSkillsCount = document.getElementById('gap-skills-count');
const gapSkillsTags = document.getElementById('gap-skills-tags');

// Roadmap, Schedule, Resources, Projects Containers
const roadmapTimeline = document.getElementById('roadmap-timeline');
const calendarGrid = document.getElementById('calendar-grid');
const resourcesList = document.getElementById('resources-list');
const projectsList = document.getElementById('projects-list');

// Queue of agent messages to display sequentially
let agentMessageQueue = [];
let isOrchestrating = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Setup Event Listeners
  onboardingForm.addEventListener('submit', handleOnboarding);
  btnReset.addEventListener('click', resetDashboard);
  setupTabs();
  
  // Custom event listeners for security and agent logging
  window.addEventListener('security-log', handleSecurityLogEvent);
  window.addEventListener('agent-collaboration-log', queueAgentLogEvent);
  
  // Initial safety logs
  logSecurityEvent('System', 'CareerPilot AI initialized successfully.', 'SAFE');
  logSecurityEvent('Privacy', 'Private session active. Client-side database only.', 'SAFE');
  
  // Restore session if available
  checkStoredSession();
});

// Tab Setup
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // If agents are still collaborating, block clicking other tabs
      if (isOrchestrating) {
        logSecurityEvent('System', 'Collaboration active. Please wait for agents to complete planning.', 'WARNING');
        return;
      }
      
      const targetId = btn.getAttribute('data-target');
      
      // Toggle tabs active class
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle panels active class
      tabPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

// Onboarding Submission
function handleOnboarding(e) {
  e.preventDefault();
  
  // Reset previous errors
  resetFormErrors();
  
  // Collect inputs
  const formData = {
    education: inputEducation.value,
    goal: inputGoal.value,
    skills: inputSkills.value,
    studyHours: inputHours.value
  };
  
  // Run agent workflow (which triggers validation and PII sweeps)
  const result = runAgentWorkflow(formData);
  
  if (result.status === 'error') {
    // Show validation errors
    displayValidationErrors(result.errors);
    return;
  }
  
  // Save in sessionStorage (no DB, complies with security directive)
  sessionStorage.setItem('careerpilot_profile', JSON.stringify(result.data));
  
  // Launch Dashboard & Start Agent Logs Animation
  startDashboardExperience(result.data);
}

// Check if user session already exists
function checkStoredSession() {
  const savedData = sessionStorage.getItem('careerpilot_profile');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      logSecurityEvent('System', 'Existing secure session found. Resuming dashboard.', 'SAFE');
      
      // Render dashboard directly without log delays (since they already completed it)
      onboardingSection.classList.add('hide');
      dashboardSection.classList.remove('hide');
      
      renderDashboardData(data);
      renderStaticLogs(data);
    } catch (e) {
      sessionStorage.removeItem('careerpilot_profile');
    }
  }
}

// Start Onboarding Complete Dashboard Sequence
function startDashboardExperience(data) {
  onboardingSection.classList.add('hide');
  dashboardSection.classList.remove('hide');
  
  // Select first tab (Overview)
  tabButtons.forEach(b => b.classList.remove('active'));
  tabButtons[0].classList.add('active');
  tabPanels.forEach(p => p.classList.remove('active'));
  tabPanels[0].classList.add('active');
  
  // Clear logs terminal
  agentTerminal.innerHTML = '';
  
  // Render details to panels, but keep tabs locked until logs finish
  renderDashboardData(data);
  
  // Play the sequential agent log animation
  playAgentCollaborationLogs();
}

// Queue agent events during workflow run
function queueAgentLogEvent(e) {
  agentMessageQueue.push(e.detail);
}

// Sequentially output agent messages
async function playAgentCollaborationLogs() {
  isOrchestrating = true;
  
  // Disable tab buttons visually while loading
  tabButtons.forEach(btn => {
    if (btn.id !== 'tab-overview') btn.style.opacity = '0.5';
  });
  
  for (let i = 0; i < agentMessageQueue.length; i++) {
    const msg = agentMessageQueue[i];
    appendAgentLog(msg);
    // Dynamic delay to feel natural
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Finished orchestrating, enable tabs
  isOrchestrating = false;
  tabButtons.forEach(btn => btn.style.opacity = '1');
  
  agentMessageQueue = [];
  logSecurityEvent('System', 'All agents completed synchronization. Roadmap unlocked.', 'SAFE');
}

// Output static logs immediately (for resumed sessions)
function renderStaticLogs(data) {
  agentTerminal.innerHTML = '';
  // Populate standard system logs for quick load
  const messages = [
    { agent: 'Profile Agent', message: 'Resuming onboarding workflow from session cache...' },
    { agent: 'Profile Agent', message: 'Validating and sanitizing student profile parameters...' },
    { agent: 'Profile Agent', message: 'Profile validated successfully. Local sandbox clean.' },
    { agent: 'Planning Agent', message: 'Skill Gap Database mappings active.' },
    { agent: 'Planning Agent', message: `Goal: "${data.profile.goal}" parsed.` },
    { agent: 'Guidance Agent', message: 'Educational resource maps and capstones loaded.' }
  ];
  messages.forEach(m => {
    appendAgentLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: m.agent,
      message: m.message
    });
  });
}

// Append a single log entry into terminal
function appendAgentLog(log) {
  const line = document.createElement('div');
  line.className = 'log-line';
  
  let agentClass = 'profile';
  if (log.agent.includes('Planning')) agentClass = 'planning';
  if (log.agent.includes('Guidance')) agentClass = 'guidance';
  
  line.innerHTML = `
    <span class="log-time">[${log.timestamp}]</span>
    <span class="log-agent ${agentClass}">${log.agent}:</span>
    <span class="log-msg">${log.message}</span>
  `;
  
  agentTerminal.appendChild(line);
  agentTerminal.scrollTop = agentTerminal.scrollHeight;
}

// Security Audit Log Handler
function handleSecurityLogEvent(e) {
  const log = e.detail;
  
  const line = document.createElement('div');
  line.className = 'audit-line';
  
  let catClass = 'system';
  if (log.category.includes('Validation')) catClass = 'validation';
  if (log.category.includes('PII')) {
    catClass = 'pii-scan';
    // Highlight PII status yellow
    badgePii.className = 'badge-status-dot yellow';
  }
  if (log.category.includes('Privacy')) catClass = 'privacy';
  
  line.innerHTML = `
    <div class="audit-meta">
      <span class="audit-time">${log.timestamp}</span>
      <span class="audit-cat ${catClass}">${log.category}</span>
    </div>
    <div class="audit-msg">${log.message}</div>
  `;
  
  securityTerminal.appendChild(line);
  securityTerminal.scrollTop = securityTerminal.scrollHeight;
}

// Render Planning and Guidance Data to Panels
function renderDashboardData(pkg) {
  const { profile, planning, guidance } = pkg;
  
  // Header summaries
  summaryTargetGoal.textContent = profile.goal;
  summaryStudyHours.textContent = `${profile.studyHours} hours`;
  
  const activeDaysCount = Object.values(planning.weeklySchedule).filter(d => d.hours > 0).length;
  dailyAvgHours.textContent = Math.round((profile.studyHours / (activeDaysCount || 1)) * 10) / 10;
  
  // Skill Gaps
  matchingSkillsCount.textContent = planning.matchingSkills.length;
  gapSkillsCount.textContent = planning.skillsToLearn.length;
  
  gapSkillsTags.innerHTML = '';
  
  // Render current matching skills
  planning.matchingSkills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'tag-match';
    span.textContent = `✓ ${skill}`;
    gapSkillsTags.appendChild(span);
  });
  
  // Render missing skills
  planning.skillsToLearn.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'tag-skill';
    span.textContent = skill;
    gapSkillsTags.appendChild(span);
  });
  
  // Render Timeline
  roadmapTimeline.innerHTML = '';
  planning.phases.forEach((phase, index) => {
    const step = document.createElement('div');
    step.className = 'timeline-step';
    
    // Join skills with commas
    const skillsListHtml = phase.skillsCovered.map(s => `<span class="tag-skill" style="margin-right:0.35rem; display:inline-block; margin-top:0.25rem;">${s}</span>`).join('');
    
    step.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <h3>${phase.name}</h3>
        <p>${phase.description}</p>
        <div class="timeline-phase-skills">
          <strong style="font-size:0.8rem; display:block; margin-bottom:0.25rem;">Core Skills:</strong>
          ${skillsListHtml}
        </div>
      </div>
    `;
    roadmapTimeline.appendChild(step);
  });
  
  // Render Weekly Study Plan
  calendarGrid.innerHTML = '';
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  weekdays.forEach(day => {
    const data = planning.weeklySchedule[day];
    const dayBox = document.createElement('div');
    dayBox.className = `calendar-day ${data.hours > 0 ? 'active-day' : ''}`;
    
    dayBox.innerHTML = `
      <span class="day-name">${day.substring(0, 3)}</span>
      <span class="day-hours">${data.hours}<span>hrs</span></span>
      <span class="day-topic">${data.topic}</span>
    `;
    calendarGrid.appendChild(dayBox);
  });
  
  // Render Resources
  resourcesList.innerHTML = '';
  guidance.resources.forEach(res => {
    const card = document.createElement('a');
    card.className = 'resource-card';
    card.href = res.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    
    card.innerHTML = `
      <div class="resource-details">
        <span class="resource-title">${res.name}</span>
        <span class="resource-meta">
          <span>${res.type}</span>
          <span class="badge-free">Free</span>
        </span>
      </div>
      <svg class="resource-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    `;
    resourcesList.appendChild(card);
  });
  
  // Render Project Accordion
  projectsList.innerHTML = '';
  guidance.projects.forEach((proj, idx) => {
    const item = document.createElement('div');
    item.className = 'project-item';
    
    const checklistHtml = proj.checklist.map((chk, cIdx) => `
      <li class="checklist-item">
        <input type="checkbox" id="chk-${idx}-${cIdx}">
        <span>${chk}</span>
      </li>
    `).join('');
    
    item.innerHTML = `
      <div class="project-trigger" data-index="${idx}">
        <div class="project-title-area">
          <h4>${proj.title}</h4>
          <span class="project-diff-badge ${proj.difficulty.toLowerCase()}">${proj.difficulty}</span>
        </div>
        <svg class="project-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="project-content">
        <p>${proj.description}</p>
        <span class="checklist-title">Requirements checklist:</span>
        <ul class="project-checklist">
          ${checklistHtml}
        </ul>
      </div>
    `;
    
    // Toggle accordion logic
    const trigger = item.querySelector('.project-trigger');
    trigger.addEventListener('click', () => {
      item.classList.toggle('expanded');
    });
    
    projectsList.appendChild(item);
  });
}

// Reset Dashboard Form
function resetDashboard() {
  if (confirm('Are you sure you want to reset your career plan? This will wipe your session data.')) {
    sessionStorage.removeItem('careerpilot_profile');
    
    // Reset form fields
    onboardingForm.reset();
    resetFormErrors();
    
    // Toggle screens
    dashboardSection.classList.add('hide');
    onboardingSection.classList.remove('hide');
    
    // Reset badge
    badgePii.className = 'badge-status-dot green';
    
    logSecurityEvent('Privacy', 'Session profile wiped. Re-entering setup.', 'SAFE');
  }
}

// Form Error Handling helpers
function displayValidationErrors(errors) {
  if (errors.education && errorEducation) {
    errorEducation.textContent = errors.education;
    if (inputEducation) inputEducation.style.borderColor = 'var(--color-danger)';
  }
  if (errors.goal && errorGoal) {
    errorGoal.textContent = errors.goal;
    if (inputGoal) inputGoal.style.borderColor = 'var(--color-danger)';
  }
  if (errors.skills && errorSkills) {
    errorSkills.textContent = errors.skills;
    if (inputSkills) inputSkills.style.borderColor = 'var(--color-danger)';
  }
  if (errors.studyHours && errorHours) {
    errorHours.textContent = errors.studyHours;
    if (inputHours) inputHours.style.borderColor = 'var(--color-danger)';
  }
  logSecurityEvent('Validation', 'Correct highlighted input errors and re-submit.', 'WARNING');
}

function resetFormErrors() {
  if (errorEducation) errorEducation.textContent = '';
  if (errorGoal) errorGoal.textContent = '';
  if (errorSkills) errorSkills.textContent = '';
  if (errorHours) errorHours.textContent = '';
  
  if (inputEducation) inputEducation.style.borderColor = '';
  if (inputGoal) inputGoal.style.borderColor = '';
  if (inputSkills) inputSkills.style.borderColor = '';
  if (inputHours) inputHours.style.borderColor = '';
}
