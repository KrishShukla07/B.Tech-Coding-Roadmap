// Testing utilities for functionality checks
const TestUtils = {
    // Error tracking
    errorLog: [],
    
    // Log error for later review
    logError: function(component, error) {
        this.errorLog.push({
            component,
            error,
            timestamp: new Date().toISOString()
        });
    },

    // Get error log
    getErrorLog: function() {
        return this.errorLog;
    },

    // Clear error log
    clearErrorLog: function() {
        this.errorLog = [];
    },
    logResult: function(testName, result, details = '') {
        console.log(
            `%c${testName}: ${result ? '✓ PASS' : '✗ FAIL'}`,
            `color: ${result ? 'green' : 'red'}; font-weight: bold;`,
            details ? `\n${details}` : ''
        );
        return result;
    },

    testComponent: function(componentName, tests) {
        console.log(`\n%cTesting ${componentName}...`, 'font-size: 14px; font-weight: bold; color: #0066cc');
        const results = tests.map(test => ({
            name: test.name,
            result: test.test(),
            details: test.details
        }));
        
        const passed = results.filter(r => r.result).length;
        const total = results.length;
        
        results.forEach(r => this.logResult(r.name, r.result, r.details));
        console.log(`\n${passed}/${total} tests passed for ${componentName}\n${'-'.repeat(50)}`);
    },

    checkStorage: function() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    },

    checkServiceWorker: function() {
        return 'serviceWorker' in navigator;
    },

    checkNetworkConnection: function() {
        return navigator.onLine;
    },

    validateJSON: function(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Component-specific test suites
    testNavigation: function() {
        this.testComponent('Navigation', [
            {
                name: 'Hamburger Menu Button',
                test: () => {
                    const btn = document.getElementById('hamburger-btn');
                    return !!btn && btn.getAttribute('aria-label') === 'Toggle menu';
                }
            },
            {
                name: 'Navigation Items Count',
                test: () => document.querySelectorAll('.nav-item').length === 5
            },
            {
                name: 'Active Navigation Item',
                test: () => document.querySelector('.nav-item.active') !== null
            },
            {
                name: 'Drawer Close Button',
                test: () => {
                    const btn = document.getElementById('close-drawer-btn');
                    return !!btn && btn.getAttribute('aria-label') === 'Close menu';
                }
            }
        ]);
    },

    testRoadmap: function() {
        this.testComponent('Roadmap View', [
            {
                name: 'Roadmap Container',
                test: () => document.getElementById('roadmap-phases') !== null
            },
            {
                name: 'Phase Data Loading',
                test: () => {
                    const data = JSON.parse(document.getElementById('app-data').textContent);
                    return data.phases && data.phases.length === 6;
                }
            }
        ]);
    },

    testTimer: function() {
        this.testComponent('Pomodoro Timer', [
            {
                name: 'Timer Display',
                test: () => {
                    const display = document.getElementById('timer-display');
                    return display && display.textContent.match(/^\d{2}:\d{2}$/);
                }
            },
            {
                name: 'Timer Controls',
                test: () => {
                    return document.getElementById('start-btn') &&
                           document.getElementById('stop-btn') &&
                           document.getElementById('reset-btn');
                }
            },
            {
                name: 'Timer Status',
                test: () => document.getElementById('timer-status') !== null
            }
        ]);
    },

    testResourcesHub: function() {
        this.testComponent('Resources Hub', [
            {
                name: 'Resource Tabs',
                test: () => document.querySelectorAll('.tab-btn').length === 3
            },
            {
                name: 'Resources Data',
                test: () => {
                    const data = JSON.parse(document.getElementById('app-data').textContent);
                    return data.resourcesHub &&
                           data.resourcesHub.platforms &&
                           data.resourcesHub.cheatSheets &&
                           data.resourcesHub.courses;
                }
            },
            {
                name: 'Active Tab Content',
                test: () => document.querySelector('.tab-content.active') !== null
            }
        ]);
    },

    testHackathonCalendar: function() {
        this.testComponent('Hackathon Calendar', [
            {
                name: 'Table Structure',
                test: () => {
                    const table = document.getElementById('hackathons-table');
                    return table && table.querySelector('thead') && table.querySelector('tbody');
                }
            },
            {
                name: 'Hackathon Data',
                test: () => {
                    const data = JSON.parse(document.getElementById('app-data').textContent);
                    return data.hackathons && data.hackathons.length > 0;
                }
            }
        ]);
    },

    testInteractions: function() {
        this.testComponent('User Interactions', [
            {
                name: 'Navigation Menu Toggle',
                test: () => {
                    const hamburger = document.getElementById('hamburger-btn');
                    const drawer = document.getElementById('side-drawer');
                    
                    if (!hamburger || !drawer) return false;
                    
                    // Test opening
                    hamburger.click();
                    const isOpen = !drawer.classList.contains('hidden');
                    
                    // Test closing
                    document.getElementById('close-drawer-btn').click();
                    const isClosed = drawer.classList.contains('hidden');
                    
                    return isOpen && isClosed;
                }
            },
            {
                name: 'Tab Switching',
                test: () => {
                    const tabs = document.querySelectorAll('.tab-btn');
                    if (tabs.length === 0) return false;
                    
                    let success = true;
                    tabs.forEach(tab => {
                        tab.click();
                        const targetId = `${tab.dataset.tab}-content`;
                        const content = document.getElementById(targetId);
                        if (!content || !content.classList.contains('active')) {
                            success = false;
                        }
                    });
                    return success;
                }
            },
            {
                name: 'Timer Controls',
                test: () => {
                    const startBtn = document.getElementById('start-btn');
                    const stopBtn = document.getElementById('stop-btn');
                    const resetBtn = document.getElementById('reset-btn');
                    
                    if (!startBtn || !stopBtn || !resetBtn) return false;
                    
                    startBtn.click();
                    const isRunning = window.timerRunning === true;
                    
                    stopBtn.click();
                    const isStopped = window.timerRunning === false;
                    
                    resetBtn.click();
                    const isReset = document.getElementById('timer-display').textContent === '25:00';
                    
                    return isRunning && isStopped && isReset;
                }
            }
        ]);
    },

    runSpecificTest: function(componentName) {
        switch(componentName.toLowerCase()) {
            case 'navigation':
                this.testNavigation();
                break;
            case 'roadmap':
                this.testRoadmap();
                break;
            case 'timer':
                this.testTimer();
                break;
            case 'resources':
                this.testResourcesHub();
                break;
            case 'hackathons':
                this.testHackathonCalendar();
                break;
            case 'interactions':
                this.testInteractions();
                break;
            default:
                console.log('Available components to test:', [
                    'navigation',
                    'roadmap',
                    'timer',
                    'resources',
                    'hackathons',
                    'interactions'
                ]);
        }
    },

    runAllTests: function() {
        console.log('%cRunning Component Tests...', 'font-size: 14px; font-weight: bold;');
        
        // Core functionality tests
        this.logResult('Local Storage Available', this.checkStorage());
        this.logResult('Service Worker Support', this.checkServiceWorker());
        this.logResult('Network Connection', this.checkNetworkConnection());
        
        // Component-specific tests
        this.testNavigation();
        this.testRoadmap();
        this.testTimer();
        this.testResourcesHub();
        this.testHackathonCalendar();
        this.testInteractions();

        // Test completion message
        console.log('\n%cAll component tests completed', 'color: blue; font-weight: bold;');
    }
};

// Add to window for console access
window.TestUtils = TestUtils;

// Run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all scripts are loaded
    setTimeout(() => TestUtils.runAllTests(), 1000);
});
