// B.Tech Coding Roadmap - Main Application Script

// Global variables
let appData = {};
let checkboxStates = JSON.parse(localStorage.getItem('checkboxStates') || '{}');
let currentPanel = localStorage.getItem('currentPanel') || 'roadmap';
let timerInterval = null;
let timerMinutes = parseInt(localStorage.getItem('timerMinutes')) || 25;
let timerSeconds = parseInt(localStorage.getItem('timerSeconds')) || 0;
let timerRunning = false;

// Show status message
function showStatus(message, type = 'info') {
    const indicator = document.getElementById('status-indicator');
    const messageEl = indicator.querySelector('.status-message');
    
    indicator.className = `status-indicator ${type}`;
    messageEl.textContent = message;
    indicator.removeAttribute('hidden');
    
    setTimeout(() => {
        indicator.setAttribute('hidden', '');
    }, 3000);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                showStatus('Application ready for offline use', 'success');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
                showStatus('Offline mode not available', 'error');
            });
    }

    // Setup offline detection
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    loadAppData();
    setupEventListeners();
    initializeRouter();
    renderRoadmap();
    updateProgressBars();
});

function updateOnlineStatus() {
    const notification = document.getElementById('offline-notification');
    if (!navigator.onLine) {
        notification.removeAttribute('hidden');
    } else {
        notification.setAttribute('hidden', '');
    }
}

// Load application data from JSON script tag
function loadAppData() {
    const dataScript = document.getElementById('app-data');
    if (dataScript) {
        try {
            appData = JSON.parse(dataScript.textContent);
        } catch (error) {
            console.error('Failed to parse application data:', error);
            appData = {};
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const sideDrawer = document.getElementById('side-drawer');

    hamburgerBtn?.addEventListener('click', openDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);
    closeDrawerBtn?.addEventListener('click', closeDrawer);

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const panel = this.dataset.panel;
            navigateToPanel(panel);
            closeDrawer();
        });
    });

    // Resources hub tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchResourcesTab(tab);
        });
    });

    // Pomodoro timer controls
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');

    startBtn?.addEventListener('click', startTimer);
    stopBtn?.addEventListener('click', stopTimer);
    resetBtn?.addEventListener('click', resetTimer);

    // Handle clicks on dynamic content
    document.addEventListener('click', function(e) {
        // Phase header clicks for accordion
        if (e.target.closest('.phase-header')) {
            const phaseCard = e.target.closest('.phase-card');
            togglePhaseExpansion(phaseCard);
        }

        // Checkbox clicks
        if (e.target.classList.contains('milestone-checkbox') || e.target.classList.contains('project-checkbox')) {
            toggleCheckbox(e.target);
        }
    });

    // Hash change listener for routing
    window.addEventListener('hashchange', handleHashChange);
}

// Router functions
function initializeRouter() {
    const hash = window.location.hash.slice(1) || 'roadmap';
    navigateToPanel(hash);
}

function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'roadmap';
    navigateToPanel(hash);
}

function navigateToPanel(panel) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-panel="${panel}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Hide all panel contents
    document.querySelectorAll('.panel-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show target panel
    const targetPanel = document.getElementById(`${panel}-view`);
    if (targetPanel) {
        targetPanel.classList.add('active');
        currentPanel = panel;
        
        // Update URL hash
        if (window.location.hash.slice(1) !== panel) {
            window.location.hash = panel;
        }

        // Render panel content if needed
        switch(panel) {
            case 'roadmap':
                renderRoadmap();
                break;
            case 'career-tracks':
                renderTracks();
                break;
            case 'hackathon-calendar':
                renderHackathons();
                break;
            case 'resources-hub':
                renderResources();
                break;
            case 'time-management':
                renderTimeMgmt();
                break;
        }
    }
}

// Drawer functions
function openDrawer() {
    const drawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    drawer?.classList.add('active');
    overlay?.classList.add('active');
}

function closeDrawer() {
    const drawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
}

// Roadmap rendering and functionality
function renderRoadmap() {
    const container = document.getElementById('roadmap-phases');
    if (!container || !appData.phases) return;

    container.innerHTML = '';

    appData.phases.forEach((phase, phaseIndex) => {
        const phaseCard = document.createElement('div');
        phaseCard.className = 'phase-card';
        phaseCard.dataset.phaseIndex = phaseIndex;

        const progress = calculatePhaseProgress(phaseIndex);

        phaseCard.innerHTML = `
            <div class="phase-header">
                <div class="phase-info">
                    <h3>${phase.name}</h3>
                    <div class="phase-duration">${phase.duration}</div>
                </div>
                <div class="phase-progress">
                    <span class="progress-text">${progress}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <i class="fas fa-chevron-down expand-icon"></i>
                </div>
            </div>
            <div class="phase-content">
                <div class="phase-body">
                    <div class="phase-section">
                        <h4><i class="fas fa-tasks"></i> Milestones</h4>
                        <ul class="milestone-list">
                            ${phase.milestones.map((milestone, index) => `
                                <li class="milestone-item ${isCheckboxChecked('milestone', phaseIndex, index) ? 'completed' : ''}">
                                    <div class="milestone-checkbox ${isCheckboxChecked('milestone', phaseIndex, index) ? 'checked' : ''}" 
                                         data-type="milestone" data-phase="${phaseIndex}" data-index="${index}"></div>
                                    <span class="milestone-text">${milestone}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="phase-section">
                        <h4><i class="fas fa-project-diagram"></i> Mini Projects</h4>
                        <ul class="project-list">
                            ${phase.projects.map((project, index) => `
                                <li class="project-item ${isCheckboxChecked('project', phaseIndex, index) ? 'completed' : ''}">
                                    <div class="project-checkbox ${isCheckboxChecked('project', phaseIndex, index) ? 'checked' : ''}" 
                                         data-type="project" data-phase="${phaseIndex}" data-index="${index}"></div>
                                    <span class="project-text">${project}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="phase-section">
                        <h4><i class="fas fa-external-link-alt"></i> Resources</h4>
                        <ul class="resource-list">
                            ${phase.resources.map(resource => `
                                <li class="resource-item">
                                    <i class="fas fa-link"></i>
                                    <a href="${resource.url}" target="_blank" class="resource-link">${resource.label}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(phaseCard);
    });
}

function togglePhaseExpansion(phaseCard) {
    phaseCard.classList.toggle('expanded');
}

function toggleCheckbox(checkbox) {
    const type = checkbox.dataset.type;
    const phaseIndex = parseInt(checkbox.dataset.phase);
    const itemIndex = parseInt(checkbox.dataset.index);
    
    const key = `${type}-${phaseIndex}-${itemIndex}`;
    checkboxStates[key] = !checkboxStates[key];
    
    // Update checkbox appearance
    const listItem = checkbox.closest(`.${type}-item`);
    if (checkboxStates[key]) {
        checkbox.classList.add('checked');
        listItem.classList.add('completed');
    } else {
        checkbox.classList.remove('checked');
        listItem.classList.remove('completed');
    }
    
    // Update progress bars
    updateProgressBars();
}

function isCheckboxChecked(type, phaseIndex, itemIndex) {
    const key = `${type}-${phaseIndex}-${itemIndex}`;
    return !!checkboxStates[key];
}

function calculatePhaseProgress(phaseIndex) {
    if (!appData.phases || !appData.phases[phaseIndex]) return 0;
    
    const phase = appData.phases[phaseIndex];
    const totalItems = phase.milestones.length + phase.projects.length;
    let completedItems = 0;
    
    // Count completed milestones
    phase.milestones.forEach((_, index) => {
        if (isCheckboxChecked('milestone', phaseIndex, index)) {
            completedItems++;
        }
    });
    
    // Count completed projects
    phase.projects.forEach((_, index) => {
        if (isCheckboxChecked('project', phaseIndex, index)) {
            completedItems++;
        }
    });
    
    return Math.round((completedItems / totalItems) * 100);
}

function updateProgressBars() {
    document.querySelectorAll('.phase-card').forEach((card, index) => {
        const progress = calculatePhaseProgress(index);
        const progressText = card.querySelector('.progress-text');
        const progressFill = card.querySelector('.progress-fill');
        
        if (progressText && progressFill) {
            progressText.textContent = `${progress}%`;
            progressFill.style.width = `${progress}%`;
        }
    });
}

// Career tracks rendering
function renderTracks() {
    const container = document.getElementById('career-tracks-grid');
    if (!container || !appData.tracks) return;

    container.innerHTML = '';

    appData.tracks.forEach(track => {
        const trackCard = document.createElement('div');
        trackCard.className = 'career-track';

        trackCard.innerHTML = `
            <h3>${track.name}</h3>
            <div class="career-meta">
                <div class="meta-item">
                    <div class="meta-label">Timeline</div>
                    <div class="meta-value">${track.timeline}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Salary Range</div>
                    <div class="meta-value">${track.salaryRange}</div>
                </div>
            </div>
            <div class="skills-section">
                <h4>Key Skills</h4>
                <div class="skills-tags">
                    ${track.keySkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;

        container.appendChild(trackCard);
    });
}

// Hackathons rendering
function renderHackathons() {
    const tbody = document.getElementById('hackathons-tbody');
    if (!tbody || !appData.hackathons) return;

    tbody.innerHTML = '';

    appData.hackathons.forEach(hackathon => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hackathon.date}</td>
            <td>${hackathon.event}</td>
            <td>${hackathon.location}</td>
            <td>${hackathon.prize}</td>
        `;
        tbody.appendChild(row);
    });
}

// Resources hub rendering
function renderResources() {
    if (!appData.resourcesHub) return;

    // Render platforms
    renderResourceCategory('platforms', appData.resourcesHub.platforms);
    renderResourceCategory('cheat-sheets', appData.resourcesHub.cheatSheets);
    renderResourceCategory('courses', appData.resourcesHub.courses);
}

function renderResourceCategory(category, resources) {
    const container = document.getElementById(`${category}-grid`);
    if (!container || !resources) return;

    container.innerHTML = '';

    resources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';

        resourceCard.innerHTML = `
            <h4>${resource.label}</h4>
            <a href="${resource.url}" target="_blank" class="resource-link">
                <i class="fas fa-external-link-alt"></i>
                Visit Resource
            </a>
        `;

        container.appendChild(resourceCard);
    });
}

function switchResourcesTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.resources-content .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`)?.classList.add('active');
}

// Time management rendering
function renderTimeMgmt() {
    const container = document.getElementById('techniques-list');
    if (!container || !appData.timeMgmt) return;

    container.innerHTML = '';

    appData.timeMgmt.forEach(technique => {
        const techniqueItem = document.createElement('div');
        techniqueItem.className = 'technique-item';

        techniqueItem.innerHTML = `
            <div class="technique-name">${technique.technique}</div>
            <div class="technique-description">${technique.description}</div>
        `;

        container.appendChild(techniqueItem);
    });
}

// Pomodoro timer functions
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        document.getElementById('timer-display')?.classList.add('running');
        document.getElementById('timer-status').textContent = 'Focus time! Stay concentrated.';
        
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function stopTimer() {
    timerRunning = false;
    document.getElementById('timer-display')?.classList.remove('running');
    document.getElementById('timer-status').textContent = 'Timer paused. Take a moment to regroup.';
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    timerMinutes = 25;
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-status').textContent = 'Ready to focus!';
}

function updateTimer() {
    if (timerSeconds === 0) {
        if (timerMinutes === 0) {
            // Timer finished
            stopTimer();
            alert('Take a break! You\'ve completed a 25-minute focus session.');
            resetTimer();
            return;
        }
        timerMinutes--;
        timerSeconds = 59;
    } else {
        timerSeconds--;
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
        const mins = timerMinutes.toString().padStart(2, '0');
        const secs = timerSeconds.toString().padStart(2, '0');
        display.textContent = `${mins}:${secs}`;
    }
}

// Initialize timer display
function initializeTimer() {
    updateTimerDisplay();
}