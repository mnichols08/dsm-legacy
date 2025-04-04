/**
 * This is a diagnostic script to verify if web components are properly registered
 */

console.log('Component registration test script running...');

// Function to check if component is registered
function isComponentDefined(name) {
  const isDefined = customElements.get(name) !== undefined;
  console.log(`Component ${name} is ${isDefined ? 'defined' : 'NOT defined'}`);
  return isDefined;
}

// Create a function to test and report on all components
function testComponentRegistration() {
  const components = [
    'dsm-navbar',
    'dsm-hero',
    'dsm-timeline',
    'dsm-timeline-item',
    'dsm-vehicle-card',
    'dsm-gallery',
    'dsm-gallery-item',
    'dsm-footer',
    'dsm-back-to-top'
  ];
  
  const results = components.map(isComponentDefined);
  const allDefined = results.every(result => result === true);
  
  console.log(`Component registration test ${allDefined ? 'PASSED' : 'FAILED'}`);
  
  // Add visual indicator to the page for debugging
  const existingDebug = document.querySelector('#component-debug');
  if (existingDebug) {
    document.body.removeChild(existingDebug);
  }
  
  if (!allDefined) {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'component-debug';
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '0';
    debugDiv.style.left = '0';
    debugDiv.style.backgroundColor = 'red';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    debugDiv.style.zIndex = '10000';
    debugDiv.textContent = 'Component registration failed - check console';
    document.body.appendChild(debugDiv);
  }
}

// Wait a bit longer before checking components
setTimeout(testComponentRegistration, 2000);

// Also run test when components-loaded event fires
document.addEventListener('components-loaded', () => {
  console.log('components-loaded event received, running component test...');
  setTimeout(testComponentRegistration, 500);
});
