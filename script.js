/**
 * WG Access Comparator - Application Logic
 * Built by David Duke Essel · AQCM
 * 
 * Complete validation tool for Wood Gundy access management
 * Supports Add, Modify, and Monthly workflows with full feature set
 */

// ============================================
// GLOBAL STATE
// ============================================
const appState = {
    activityLog: [],
    options: {
        autoScroll: true,
        showStats: true,
        logActivity: true
    }
};

// ============================================
// ROLE MATRIX CONFIGURATION
// ============================================
const ROLE_MATRIX = {
  "BA & CAGE INQUIRY": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*ICAGEFUNC", SCON: "*SICAGESCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: { allowed: false }
  },

  "BA/ABM/BM and Backup": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*BRMGTFUNC", SCON: "*SBRMGTSCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "Branch Assistant & Cage Profile": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*CAGEFUNC", SCON: "*SCAGESCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "IA PROFILE": {
    allowBranchBundle: false,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*IAFUNC", SCON: "*IASCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: { allowed: false }
  },

  "ASSOCIATE IA PROFILE": {
    allowBranchBundle: false,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*AIAFUNC", SCON: "*AIASCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "SA WITH TRANSIT & SYND. PROFILE": {
    allowBranchBundle: false,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*SATRSYFUNC", SCON: "*SATRSYSCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "SA WITH SYNDICATE PROFILE": {
    allowBranchBundle: false,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*SASYNBFUNC", SCON: "*SASYNBSCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "SA PROFILE": {
    allowBranchBundle: false,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*SAFUNC", SCON: "*SASCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  },

  "INQUIRY ONLY - BRANCH ASSISTANT AND CAGE PROFILE - Secondary Role": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: null, SCON: null },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: { allowed: false }
  },

  "BA/ABM/BM ACWS INQUIRY": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: null, SCON: null },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: { allowed: false }
  },

  "BA ABM BM AND BACKUP PROFILE": {
    allowBranchBundle: true,
    requires: { client66: true, client72: false },
    defaults: { FILE: "*WGDFAR", MRGN: "*WGDFAR" },
    func_scon: {
      "66": { FUNC: "*BRMGTFUNC", SCON: "*SBRMGTSCON" },
      "72": { FUNC: null, SCON: null }
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true
    },
    chequeWriting: {
      allowed: true,
      dept: "B",
      range: "069-999"
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse input text into array of clean codes
 * @param {string} text - Raw input text
 * @param {boolean} stripRRRR - Whether to strip RRRR= prefix
 * @returns {Array<string>} Array of clean codes
 */
function parseInput(text, stripRRRR = false) {
  if (!text || typeof text !== 'string') return [];
  
  // Split by spaces, newlines, commas, semicolons
  let codes = text.split(/[\s\n\r,;]+/);
  
  // Clean each code
  codes = codes.map(code => {
    code = code.trim();
    
    // Strip RRRR= prefix if needed (Monthly mode)
    if (stripRRRR && code.toUpperCase().startsWith('RRRR=')) {
      code = code.substring(5);
    }
    
    return code.toUpperCase();
  });
  
  // Filter out empty and ignored patterns
  codes = codes.filter(code => {
    if (!code) return false;
    if (/^SNON\d+$/i.test(code)) return false;  // SNON123
    if (/^V0\d+/i.test(code)) return false;      // V0123
    if (code.includes('@')) return false;         // emails
    if (/^\d+$/.test(code)) return false;         // pure numbers
    return true;
  });
  
  // Remove duplicates
  return [...new Set(codes)];
}

/**
 * Classify a code by type
 * @param {string} code - Code to classify
 * @returns {string} Code type
 */
function classifyCode(code) {
  code = code.toUpperCase();
  
  // Branch bundles
  if (/^\*A(445|446|457|463)FC$/i.test(code)) {
    return 'branch-bundle';
  }
  
  // BRX codes
  if (/^BRX\d{3,4}(FC)?$/i.test(code)) {
    return 'brx';
  }
  
  // RPTS base codes
  if (/^(WGSTD|WGCOMMSTD|WGBRANCH|WGCOMPL)$/i.test(code)) {
    return 'rpts-base';
  }
  
  // RPTS regional codes
  if (/^(REGA|REGB|REGC|REGD|REGE|REGF|REGALL)$/i.test(code)) {
    return 'rpts-regional';
  }
  
  // FUNC/SCON markers
  const funcMarkers = [
    '*SAFUNC', '*SASCON', '*IAFUNC', '*IASCON',
    '*AIAFUNC', '*AIASCON', '*SATRSYFUNC', '*SATRSYSCON',
    '*SASYNBFUNC', '*SASYNBSCON', '*BRMGTFUNC', '*SBRMGTSCON',
    '*CAGEFUNC', '*SCAGESCON', '*ICAGEFUNC', '*SICAGESCON',
    '*CAGESCON'
  ];
  if (funcMarkers.includes(code)) {
    return 'func-scon';
  }
  
  // Default files
  if (code === '*WGDFAR') {
    return 'default-file';
  }
  
  // Default: IA code
  return 'ia-code';
}

/**
 * Detect if code is an INS code
 * @param {string} code - Code to check
 * @returns {Object} { isINS: boolean, reason: string }
 */
function detectINS(code) {
  code = code.toUpperCase();
  
  // Known INS codes
  const knownINS = ['RRU', 'A15', 'B22', 'R03', 'INS', 'MIRACLE'];
  if (knownINS.includes(code)) {
    return {
      isINS: true,
      reason: 'Known INS code'
    };
  }
  
  // Pattern: Letter + 2 digits (A15, B22, R03)
  if (/^[ABR]\d{2}$/i.test(code)) {
    return {
      isINS: true,
      reason: 'INS pattern (Letter+2 digits)'
    };
  }
  
  // Contains INS or MIRACLE
  if (/INS|MIRACLE/i.test(code)) {
    return {
      isINS: true,
      reason: 'Contains INS/MIRACLE'
    };
  }
  
  return { isINS: false };
}

/**
 * Validate matrix requirements
 * @param {Array<string>} addedCodes - All codes that were added
 * @param {string} role - Selected role
 * @returns {Object} { errors: [], warnings: [], details: {} }
 */
function validateMatrix(addedCodes, role) {
  const config = ROLE_MATRIX[role];
  if (!config) {
    return { errors: [], warnings: [], details: {} };
  }
  
  const errors = [];
  const warnings = [];
  const details = {
    funcScon: { required: [], found: [], missing: [] },
    rpts: { base: null, regional: null, notes: [] },
    branchBundle: { allowed: config.allowBranchBundle, found: false }
  };
  
  // 1. Check FUNC/SCON requirements
  if (config.requires.client66 && config.func_scon['66'].FUNC) {
    const requiredFunc = config.func_scon['66'].FUNC;
    const requiredScon = config.func_scon['66'].SCON;
    
    details.funcScon.required.push(requiredFunc, requiredScon);
    
    if (addedCodes.includes(requiredFunc)) {
      details.funcScon.found.push(requiredFunc);
    } else {
      details.funcScon.missing.push(requiredFunc);
      errors.push(`Missing required FUNC: ${requiredFunc}`);
    }
    
    if (addedCodes.includes(requiredScon)) {
      details.funcScon.found.push(requiredScon);
    } else {
      details.funcScon.missing.push(requiredScon);
      errors.push(`Missing required SCON: ${requiredScon}`);
    }
  }
  
  // 2. Check RPTS composition
  const rptsBase = ['WGSTD', 'WGCOMMSTD', 'WGBRANCH', 'WGCOMPL'];
  const rptsRegional = ['REGA', 'REGB', 'REGC', 'REGD', 'REGE', 'REGF', 'REGALL'];
  
  const foundBase = addedCodes.find(code => rptsBase.includes(code));
  const foundRegional = addedCodes.find(code => rptsRegional.includes(code));
  
  details.rpts.base = foundBase || null;
  details.rpts.regional = foundRegional || null;
  
  if (config.rpts.baseRequired && !foundBase) {
    errors.push('Missing base RPTS code (need WGSTD, WGCOMMSTD, WGBRANCH, or WGCOMPL)');
  }
  
  if (config.rpts.regionalRequired && !foundRegional) {
    errors.push('Missing regional RPTS code (need REGA-REGF or REGALL)');
  }
  
  // 3. Check branch bundle restrictions
  const hasBranchBundle = addedCodes.some(code => 
    /^\*A(445|446|457|463)FC$/i.test(code)
  );
  
  details.branchBundle.found = hasBranchBundle;
  
  if (!config.allowBranchBundle && hasBranchBundle) {
    errors.push(`Role "${role}" cannot have branch bundles`);
  }
  
  // 4. Check matrix notes
  if (config.rpts.notes.length > 0) {
    details.rpts.notes = config.rpts.notes;
    
    for (const note of config.rpts.notes) {
      if (note.includes('Add WGBRANCH')) {
        if (!addedCodes.includes('WGBRANCH')) {
          warnings.push('Matrix note: Add WGBRANCH in RPTS');
        }
      }
    }
  }
  
  return { errors, warnings, details };
}

/**
 * Update token count for a textarea
 * @param {string} textareaId - ID of textarea
 * @param {string} countId - ID of count element
 */
function updateTokenCount(textareaId, countId) {
  const textarea = document.getElementById(textareaId);
  const countEl = document.getElementById(countId);
  
  if (!textarea || !countEl) return;
  
  const text = textarea.value;
  const codes = parseInput(text, false);
  countEl.textContent = `${codes.length} code${codes.length !== 1 ? 's' : ''}`;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: success, error, warning, info
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Log activity
 * @param {string} message - Activity message
 */
function logActivity(message) {
  if (!appState.options.logActivity) return;
  
  const timestamp = new Date().toLocaleString();
  appState.activityLog.unshift({
    time: timestamp,
    message: message
  });
  
  // Keep only last 50 entries
  if (appState.activityLog.length > 50) {
    appState.activityLog = appState.activityLog.slice(0, 50);
  }
}

// Continue to Part 2...
// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle mode change
 */
function onModeChange() {
  const mode = document.getElementById('mode-select').value;
  
  // Hide all mode inputs
  document.getElementById('add-inputs').style.display = 'none';
  document.getElementById('modify-inputs').style.display = 'none';
  document.getElementById('monthly-inputs').style.display = 'none';
  
  // Show selected mode inputs
  if (mode === 'Add') {
    document.getElementById('add-inputs').style.display = 'block';
  } else if (mode === 'Modify') {
    document.getElementById('modify-inputs').style.display = 'block';
  } else if (mode === 'Monthly') {
    document.getElementById('monthly-inputs').style.display = 'block';
  }
  
  // Hide results
  document.getElementById('results-section').style.display = 'none';
  
  // Update role requirement visibility
  const roleGroup = document.getElementById('role-group');
  if (mode === 'Monthly') {
    roleGroup.style.display = 'none';
  } else {
    roleGroup.style.display = 'flex';
  }
}

/**
 * Clear all inputs and results
 */
function clearAll() {
  // Clear all textareas
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(ta => {
    ta.value = '';
  });
  
  // Update all token counts
  updateAllTokenCounts();
  
  // Hide results
  document.getElementById('results-section').style.display = 'none';
  
  showToast('All fields cleared', 'info');
  logActivity('Cleared all fields');
}

/**
 * Update all token counts
 */
function updateAllTokenCounts() {
  const countMappings = [
    ['add-servicenow', 'add-servicenow-count'],
    ['add-reflection', 'add-reflection-count'],
    ['modify-servicenow', 'modify-servicenow-count'],
    ['modify-deleted', 'modify-deleted-count'],
    ['modify-readded', 'modify-readded-count'],
    ['monthly-excel', 'monthly-excel-count'],
    ['monthly-tracker', 'monthly-tracker-count'],
    ['branch-bundle-codes', 'branch-bundle-count'],
    ['codes-to-check', 'codes-check-count']
  ];
  
  countMappings.forEach(([textareaId, countId]) => {
    updateTokenCount(textareaId, countId);
  });
}

// ============================================
// COMPARISON LOGIC
// ============================================

/**
 * Main compare button handler
 */
function onCompare() {
  const mode = document.getElementById('mode-select').value;
  const role = document.getElementById('role-select').value;
  
  // Validate inputs
  if (mode === 'Monthly') {
    runMonthlyComparison();
  } else {
    // Add or Modify mode
    if (!role) {
      showToast('Please select a role', 'error');
      return;
    }
    
    if (mode === 'Add') {
      runAddComparison(role);
    } else if (mode === 'Modify') {
      runModifyComparison(role);
    }
  }
}

/**
 * Run Add mode comparison
 * @param {string} role - Selected role
 */
function runAddComparison(role) {
  // Get input values
  const servicenowText = document.getElementById('add-servicenow').value;
  const reflectionText = document.getElementById('add-reflection').value;
  
  // Validate required fields
  if (!servicenowText.trim()) {
    showToast('Please enter ServiceNow Request codes', 'error');
    return;
  }
  
  if (!reflectionText.trim()) {
    showToast('Please enter Reflection Added codes', 'error');
    return;
  }
  
  // Parse inputs
  const requestedCodes = parseInput(servicenowText, false);
  const addedCodes = parseInput(reflectionText, false);
  
  // Separate IA codes from other codes in both lists
  const requestedIA = requestedCodes.filter(code => classifyCode(code) === 'ia-code');
  const addedIA = addedCodes.filter(code => classifyCode(code) === 'ia-code');
  
  // Find matched, missing, and extra IA codes
  const matchedIA = requestedIA.filter(code => addedIA.includes(code));
  const missingIA = requestedIA.filter(code => !addedIA.includes(code));
  const extraIA = addedIA.filter(code => !requestedIA.includes(code));
  
  // Check for INS codes in missing
  const missingWithINS = missingIA.map(code => {
    const insCheck = detectINS(code);
    return {
      code: code,
      ins: insCheck
    };
  });
  
  // Get non-IA codes from added (matrix codes, etc.)
  const nonIACodes = addedCodes.filter(code => classifyCode(code) !== 'ia-code');
  
  // Validate matrix requirements
  const validation = validateMatrix(addedCodes, role);
  
  // Calculate stats
  const stats = {
    matched: matchedIA.length,
    missing: missingIA.length,
    extra: nonIACodes.length,
    errors: validation.errors.length
  };
  
  // Display results
  displayAddResults({
    requestedCodes: requestedIA,
    addedCodes: addedIA,
    allAddedCodes: addedCodes,
    matched: matchedIA,
    missing: missingWithINS,
    extra: extraIA,
    nonIACodes: nonIACodes,
    validation: validation,
    stats: stats,
    role: role
  });
  
  logActivity(`Add comparison completed for ${role}: ${matchedIA.length} matched, ${missingIA.length} missing`);
  showToast('Comparison complete', 'success');
}

/**
 * Run Modify mode comparison
 * @param {string} role - Selected role
 */
function runModifyComparison(role) {
  // Get input values
  const servicenowText = document.getElementById('modify-servicenow').value;
  const deletedText = document.getElementById('modify-deleted').value;
  const readdedText = document.getElementById('modify-readded').value;
  
  // Validate required fields
  if (!servicenowText.trim()) {
    showToast('Please enter ServiceNow Request codes', 'error');
    return;
  }
  
  if (!deletedText.trim()) {
    showToast('Please enter Reflection Deleted codes', 'error');
    return;
  }
  
  if (!readdedText.trim()) {
    showToast('Please enter Reflection Re-Added codes', 'error');
    return;
  }
  
  // Parse inputs
  const requestedCodes = parseInput(servicenowText, false);
  const deletedCodes = parseInput(deletedText, false);
  const readdedCodes = parseInput(readdedText, false);
  
  // Check what was not re-added
  const notReadded = deletedCodes.filter(code => !readdedCodes.includes(code));
  
  // Check if requested codes are in re-added
  const requestedInReadded = requestedCodes.filter(code => readdedCodes.includes(code));
  const requestedNotInReadded = requestedCodes.filter(code => !readdedCodes.includes(code));
  
  // Validate matrix requirements on final re-added codes
  const validation = validateMatrix(readdedCodes, role);
  
  // Add warning if codes not re-added
  if (notReadded.length > 0) {
    validation.warnings.push(`${notReadded.length} code(s) deleted but NOT re-added (verify if intentional)`);
  }
  
  // Calculate stats
  const stats = {
    matched: deletedCodes.filter(code => readdedCodes.includes(code)).length,
    missing: notReadded.length,
    extra: requestedInReadded.length,
    errors: validation.errors.length
  };
  
  // Display results
  displayModifyResults({
    deletedCodes: deletedCodes,
    readdedCodes: readdedCodes,
    requestedCodes: requestedCodes,
    notReadded: notReadded,
    requestedInReadded: requestedInReadded,
    requestedNotInReadded: requestedNotInReadded,
    validation: validation,
    stats: stats,
    role: role
  });
  
  logActivity(`Modify comparison completed for ${role}: ${notReadded.length} not re-added`);
  showToast('Comparison complete', 'success');
}

/**
 * Run Monthly mode comparison
 */
function runMonthlyComparison() {
  // Get input values
  const excelText = document.getElementById('monthly-excel').value;
  const trackerText = document.getElementById('monthly-tracker').value;
  
  // Validate required fields
  if (!excelText.trim()) {
    showToast('Please enter Excel codes', 'error');
    return;
  }
  
  if (!trackerText.trim()) {
    showToast('Please enter Tracker codes', 'error');
    return;
  }
  
  // Parse inputs (strip RRRR= from Excel)
  const excelCodes = parseInput(excelText, true);
  const trackerCodes = parseInput(trackerText, false);
  
  // Find duplicates (codes in both lists)
  const duplicates = excelCodes.filter(code => trackerCodes.includes(code));
  
  // Display results
  displayMonthlyResults(excelCodes, trackerCodes, duplicates);
  
  logActivity(`Monthly comparison completed: ${duplicates.length} matches found`);
  showToast('Comparison complete', 'success');
}

/**
 * Run branch code duplicate check
 */
function checkBranchDuplicates() {
  const branchText = document.getElementById('branch-bundle-codes').value;
  const checkText = document.getElementById('codes-to-check').value;
  
  if (!branchText.trim()) {
    showToast('Please enter branch bundle codes', 'error');
    return;
  }
  
  if (!checkText.trim()) {
    showToast('Please enter codes to check', 'error');
    return;
  }
  
  const branchCodes = parseInput(branchText, false);
  const codesToCheck = parseInput(checkText, false);
  
  const duplicates = codesToCheck.filter(code => branchCodes.includes(code));
  const unique = codesToCheck.filter(code => !branchCodes.includes(code));
  
  displayBranchCheckerResults(duplicates, unique);
  
  logActivity(`Branch checker: ${duplicates.length} duplicates, ${unique.length} unique`);
  showToast('Branch check complete', 'success');
}

// Continue to Part 3...
// ============================================
// DISPLAY FUNCTIONS
// ============================================

/**
 * Display Add mode results
 * @param {Object} results - Comparison results
 */
function displayAddResults(results) {
  const { requestedCodes, addedCodes, allAddedCodes, matched, missing, extra, nonIACodes, validation, stats, role } = results;
  
  // Show results section
  document.getElementById('results-section').style.display = 'block';
  document.getElementById('add-results').style.display = 'block';
  document.getElementById('modify-results').style.display = 'none';
  document.getElementById('monthly-results').style.display = 'none';
  
  // Update summary stats
  if (appState.options.showStats) {
    document.getElementById('stat-matched').textContent = stats.matched;
    document.getElementById('stat-missing').textContent = stats.missing;
    document.getElementById('stat-extra').textContent = stats.extra;
    document.getElementById('stat-errors').textContent = stats.errors;
  }
  
  // Render side-by-side comparison
  renderSideBySideComparison(requestedCodes, allAddedCodes, matched, missing, extra);
  
  // Render matrix validation details
  renderMatrixValidation(validation, role, 'matrix-validation-details');
  
  // Render errors
  renderErrorsAndWarnings(validation.errors, validation.warnings, 'validation-errors', 'warnings-list');
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display Modify mode results
 * @param {Object} results - Comparison results
 */
function displayModifyResults(results) {
  const { deletedCodes, readdedCodes, requestedCodes, notReadded, requestedInReadded, requestedNotInReadded, validation, stats, role } = results;
  
  // Show results section
  document.getElementById('results-section').style.display = 'block';
  document.getElementById('add-results').style.display = 'none';
  document.getElementById('modify-results').style.display = 'block';
  document.getElementById('monthly-results').style.display = 'none';
  
  // Update summary stats
  if (appState.options.showStats) {
    document.getElementById('stat-matched-modify').textContent = stats.matched;
    document.getElementById('stat-missing-modify').textContent = stats.missing;
    document.getElementById('stat-extra-modify').textContent = stats.extra;
    document.getElementById('stat-errors-modify').textContent = stats.errors;
  }
  
  // Render four-column comparison
  renderFourColumnComparison(deletedCodes, readdedCodes, requestedCodes, readdedCodes, notReadded, requestedInReadded);
  
  // Render matrix validation details
  renderMatrixValidation(validation, role, 'matrix-validation-details-modify');
  
  // Render errors and warnings
  renderErrorsAndWarnings(validation.errors, validation.warnings, 'validation-errors-modify', 'warnings-list-modify');
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display Monthly mode results
 * @param {Array<string>} excelCodes - Excel codes
 * @param {Array<string>} trackerCodes - Tracker codes
 * @param {Array<string>} duplicates - Duplicate codes
 */
function displayMonthlyResults(excelCodes, trackerCodes, duplicates) {
  // Show results section
  document.getElementById('results-section').style.display = 'block';
  document.getElementById('add-results').style.display = 'none';
  document.getElementById('modify-results').style.display = 'none';
  document.getElementById('monthly-results').style.display = 'block';
  
  // Render Excel codes
  const excelList = document.getElementById('excel-codes-list');
  excelList.innerHTML = '';
  
  excelCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (duplicates.includes(code)) {
      item.classList.add('matched');
    }
    
    item.textContent = code;
    excelList.appendChild(item);
  });
  
  // Render Tracker codes
  const trackerList = document.getElementById('tracker-codes-list');
  trackerList.innerHTML = '';
  
  trackerCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (duplicates.includes(code)) {
      item.classList.add('matched');
    }
    
    item.textContent = code;
    trackerList.appendChild(item);
  });
  
  // Render summary
  const summaryText = document.getElementById('monthly-summary-text');
  
  const excelOnly = excelCodes.filter(code => !trackerCodes.includes(code));
  const trackerOnly = trackerCodes.filter(code => !excelCodes.includes(code));
  
  summaryText.innerHTML = `
    <p><strong>Total Excel Codes:</strong> ${excelCodes.length}</p>
    <p><strong>Total Tracker Codes:</strong> ${trackerCodes.length}</p>
    <p><strong>Matched (Green):</strong> ${duplicates.length}</p>
    <p><strong>Excel Only:</strong> ${excelOnly.length}</p>
    <p><strong>Tracker Only:</strong> ${trackerOnly.length}</p>
  `;
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display branch checker results
 * @param {Array<string>} duplicates - Duplicate codes
 * @param {Array<string>} unique - Unique codes
 */
function displayBranchCheckerResults(duplicates, unique) {
  const resultsDiv = document.getElementById('branch-checker-results');
  resultsDiv.style.display = 'block';
  
  const duplicatesList = document.getElementById('branch-duplicates-list');
  const uniqueList = document.getElementById('branch-unique-list');
  
  // Render duplicates
  if (duplicates.length > 0) {
    duplicatesList.innerHTML = '<h4 style="color: #f44336;">⚠️ Found in Branch Codes (Duplicates):</h4>';
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexWrap = 'wrap';
    list.style.gap = '0.5rem';
    list.style.marginTop = '0.5rem';
    
    duplicates.forEach(code => {
      const chip = document.createElement('span');
      chip.className = 'code-chip';
      chip.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
      chip.style.borderColor = '#f44336';
      chip.style.color = '#f44336';
      chip.textContent = code;
      list.appendChild(chip);
    });
    
    duplicatesList.appendChild(list);
  } else {
    duplicatesList.innerHTML = '<p style="color: #4caf50;">✅ No duplicates found</p>';
  }
  
  // Render unique
  if (unique.length > 0) {
    uniqueList.innerHTML = '<h4 style="color: #4caf50; margin-top: 1rem;">✅ Not in Branch Codes (Unique):</h4>';
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexWrap = 'wrap';
    list.style.gap = '0.5rem';
    list.style.marginTop = '0.5rem';
    
    unique.forEach(code => {
      const chip = document.createElement('span');
      chip.className = 'code-chip';
      chip.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
      chip.style.borderColor = '#4caf50';
      chip.style.color = '#4caf50';
      chip.textContent = code;
      list.appendChild(chip);
    });
    
    uniqueList.appendChild(list);
  } else {
    uniqueList.innerHTML = '<p style="color: #8a8e98; margin-top: 1rem;">All codes already exist in branch</p>';
  }
}

// ============================================
// RENDERING HELPER FUNCTIONS
// ============================================

/**
 * Render side-by-side comparison for Add mode
 */
function renderSideBySideComparison(requestedCodes, addedCodes, matched, missing, extra) {
  const requestedList = document.getElementById('requested-codes-list');
  const addedList = document.getElementById('added-codes-list');
  
  requestedList.innerHTML = '';
  addedList.innerHTML = '';
  
  // Render requested codes
  requestedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    const insCheck = detectINS(code);
    
    if (matched.includes(code)) {
      item.classList.add('matched');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✓ Added</span>`;
    } else {
      item.classList.add('missing');
      
      if (insCheck.isINS) {
        item.classList.add('ins-warning');
        item.innerHTML = `
          <span>${code}</span>
          <span style="font-size: 0.75rem;">
            <span class="code-badge">INS</span>
            ${insCheck.reason}
          </span>
        `;
      } else {
        item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✗ Missing</span>`;
      }
    }
    
    requestedList.appendChild(item);
  });
  
  // Render added codes (all codes)
  addedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    const codeType = classifyCode(code);
    
    if (requestedCodes.includes(code)) {
      item.classList.add('matched');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✓ Requested</span>`;
    } else {
      // Not requested - could be matrix requirement or extra
      if (codeType === 'func-scon' || codeType === 'rpts-base' || codeType === 'rpts-regional' || codeType === 'default-file') {
        item.classList.add('extra');
        item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">Matrix Req</span>`;
      } else {
        item.classList.add('extra');
        item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">Extra</span>`;
      }
    }
    
    addedList.appendChild(item);
  });
}

/**
 * Render four-column comparison for Modify mode
 */
function renderFourColumnComparison(deletedCodes, readdedCodes, requestedCodes, finalCodes, notReadded, requestedInReadded) {
  const deletedList = document.getElementById('modify-deleted-list');
  const readdedList = document.getElementById('modify-readded-list');
  const requestedList = document.getElementById('modify-requested-list');
  const finalList = document.getElementById('modify-final-list');
  
  deletedList.innerHTML = '';
  readdedList.innerHTML = '';
  requestedList.innerHTML = '';
  finalList.innerHTML = '';
  
  // Render deleted codes
  deletedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (readdedCodes.includes(code)) {
      item.classList.add('matched');
      item.textContent = code;
    } else {
      item.classList.add('missing');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✗ Not re-added</span>`;
    }
    
    deletedList.appendChild(item);
  });
  
  // Render re-added codes
  readdedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (deletedCodes.includes(code)) {
      item.classList.add('matched');
      item.textContent = code;
    } else {
      item.classList.add('extra');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">New</span>`;
    }
    
    readdedList.appendChild(item);
  });
  
  // Render requested codes
  requestedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (requestedInReadded.includes(code)) {
      item.classList.add('matched');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✓ Added</span>`;
    } else {
      item.classList.add('missing');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✗ Missing</span>`;
    }
    
    requestedList.appendChild(item);
  });
  
  // Render final (all added codes)
  finalCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    item.textContent = code;
    finalList.appendChild(item);
  });
}

/**
 * Render matrix validation details
 */
function renderMatrixValidation(validation, role, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  const config = ROLE_MATRIX[role];
  if (!config) return;
  
  let html = `<div style="display: grid; gap: 1rem;">`;
  
  // FUNC/SCON
  if (validation.details.funcScon.required.length > 0) {
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">FUNC/SCON Requirements:</h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
    
    validation.details.funcScon.required.forEach(code => {
      const found = validation.details.funcScon.found.includes(code);
      const className = found ? 'matched' : 'missing';
      const icon = found ? '✓' : '✗';
      html += `<span class="vertical-code-item ${className}">${code} ${icon}</span>`;
    });
    
    html += `</div></div>`;
  }
  
  // RPTS
  html += `<div>
    <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">RPTS Requirements:</h4>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
  
  if (validation.details.rpts.base) {
    html += `<span class="vertical-code-item matched">${validation.details.rpts.base} ✓ Base</span>`;
  } else {
    html += `<span class="vertical-code-item missing">Missing Base RPTS ✗</span>`;
  }
  
  if (validation.details.rpts.regional) {
    html += `<span class="vertical-code-item matched">${validation.details.rpts.regional} ✓ Regional</span>`;
  } else {
    html += `<span class="vertical-code-item missing">Missing Regional RPTS ✗</span>`;
  }
  
  html += `</div></div>`;
  
  // Branch Bundle
  if (validation.details.branchBundle.allowed) {
    const status = validation.details.branchBundle.found ? 'Found' : 'Not found';
    const className = validation.details.branchBundle.found ? 'extra' : '';
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Branch Bundle:</h4>
      <span class="vertical-code-item ${className}">Allowed (${status})</span>
    </div>`;
  }
  
  html += `</div>`;
  
  container.innerHTML = html;
}

/**
 * Render errors and warnings
 */
function renderErrorsAndWarnings(errors, warnings, errorsContainerId, warningsContainerId) {
  const errorsContainer = document.getElementById(errorsContainerId);
  const warningsContainer = document.getElementById(warningsContainerId);
  const errorsSection = errorsContainer.closest('.result-section');
  const warningsSection = warningsContainer.closest('.result-section');
  
  // Render errors
  if (errors.length > 0) {
    errorsSection.style.display = 'block';
    errorsContainer.innerHTML = '';
    
    errors.forEach(error => {
      const item = document.createElement('div');
      item.className = 'error-item';
      item.textContent = error;
      errorsContainer.appendChild(item);
    });
  } else {
    errorsSection.style.display = 'none';
  }
  
  // Render warnings
  if (warnings.length > 0) {
    warningsSection.style.display = 'block';
    warningsContainer.innerHTML = '';
    
    warnings.forEach(warning => {
      const item = document.createElement('div');
      item.className = 'warning-item';
      item.textContent = warning;
      warningsContainer.appendChild(item);
    });
  } else {
    warningsSection.style.display = 'none';
  }
}

// Continue to Part 4...
// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Open modal
 * @param {string} modalId - ID of modal to open
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    
    // Update log content if opening log modal
    if (modalId === 'log-modal') {
      updateLogModal();
    }
  }
}

/**
 * Close modal
 * @param {string} modalId - ID of modal to close
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Update activity log modal content
 */
function updateLogModal() {
  const logContent = document.getElementById('log-content');
  
  if (appState.activityLog.length === 0) {
    logContent.innerHTML = '<p class="empty-state">No activity yet</p>';
    return;
  }
  
  logContent.innerHTML = '';
  
  appState.activityLog.forEach(entry => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
      <div class="log-entry-time">${entry.time}</div>
      <div class="log-entry-text">${entry.message}</div>
    `;
    logContent.appendChild(logEntry);
  });
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

/**
 * Export results to CSV
 */
function exportToCSV() {
  const mode = document.getElementById('mode-select').value;
  
  if (mode === 'Monthly') {
    exportMonthlyCSV();
  } else {
    exportValidationCSV(mode);
  }
}

/**
 * Export validation results to CSV
 */
function exportValidationCSV(mode) {
  const rows = [['Section', 'Code', 'Status', 'Notes']];
  
  if (mode === 'Add') {
    // Get requested codes
    const requestedItems = document.querySelectorAll('#requested-codes-list .vertical-code-item');
    requestedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Requested', code, 'Matched', 'Code was added']);
      } else if (item.classList.contains('ins-warning')) {
        rows.push(['Requested', code, 'Missing', 'INS CODE - Not added']);
      } else {
        rows.push(['Requested', code, 'Missing', 'Not added']);
      }
    });
    
    // Get added codes
    const addedItems = document.querySelectorAll('#added-codes-list .vertical-code-item');
    addedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Added', code, 'Matched', 'Requested']);
      } else if (item.classList.contains('extra')) {
        rows.push(['Added', code, 'Extra', 'Matrix requirement or extra']);
      }
    });
  } else if (mode === 'Modify') {
    // Get deleted codes
    const deletedItems = document.querySelectorAll('#modify-deleted-list .vertical-code-item');
    deletedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Deleted', code, 'Re-added', '']);
      } else {
        rows.push(['Deleted', code, 'Not re-added', 'Verify if intentional']);
      }
    });
    
    // Get requested codes
    const requestedItems = document.querySelectorAll('#modify-requested-list .vertical-code-item');
    requestedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Requested', code, 'Added', '']);
      } else {
        rows.push(['Requested', code, 'Missing', 'Not added']);
      }
    });
  }
  
  // Add errors
  const errorItems = document.querySelectorAll('.error-item');
  errorItems.forEach(item => {
    rows.push(['Error', '', '', item.textContent]);
  });
  
  // Add warnings
  const warningItems = document.querySelectorAll('.warning-item');
  warningItems.forEach(item => {
    rows.push(['Warning', '', '', item.textContent]);
  });
  
  downloadCSV(rows, `wg-${mode.toLowerCase()}-results.csv`);
}

/**
 * Export monthly results to CSV
 */
function exportMonthlyCSV() {
  const rows = [['Excel Codes', 'Tracker Codes', 'Status']];
  
  const excelItems = document.querySelectorAll('#excel-codes-list .vertical-code-item');
  const trackerItems = document.querySelectorAll('#tracker-codes-list .vertical-code-item');
  
  const maxLength = Math.max(excelItems.length, trackerItems.length);
  
  for (let i = 0; i < maxLength; i++) {
    const excelCode = i < excelItems.length ? excelItems[i].textContent : '';
    const trackerCode = i < trackerItems.length ? trackerItems[i].textContent : '';
    
    let status = '';
    if (excelCode && trackerCode && 
        excelItems[i].classList.contains('matched') && 
        trackerItems[i].classList.contains('matched')) {
      status = 'Matched';
    } else if (excelCode && !trackerCode) {
      status = 'Excel Only';
    } else if (!excelCode && trackerCode) {
      status = 'Tracker Only';
    }
    
    rows.push([excelCode, trackerCode, status]);
  }
  
  downloadCSV(rows, 'wg-monthly-comparison.csv');
}

/**
 * Download CSV file
 * @param {Array<Array<string>>} rows - CSV data
 * @param {string} filename - File name
 */
function downloadCSV(rows, filename) {
  const csv = rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  logActivity(`Exported results to ${filename}`);
  showToast('CSV exported successfully', 'success');
}

// ============================================
// OPTIONS FUNCTIONS
// ============================================

/**
 * Load options from localStorage
 */
function loadOptions() {
  const savedOptions = localStorage.getItem('wg-comparator-options');
  if (savedOptions) {
    appState.options = JSON.parse(savedOptions);
  }
  
  // Apply options to UI
  document.getElementById('opt-auto-scroll').checked = appState.options.autoScroll;
  document.getElementById('opt-show-stats').checked = appState.options.showStats;
  document.getElementById('opt-log-activity').checked = appState.options.logActivity;
}

/**
 * Save options to localStorage
 */
function saveOptions() {
  appState.options.autoScroll = document.getElementById('opt-auto-scroll').checked;
  appState.options.showStats = document.getElementById('opt-show-stats').checked;
  appState.options.logActivity = document.getElementById('opt-log-activity').checked;
  
  localStorage.setItem('wg-comparator-options', JSON.stringify(appState.options));
  
  showToast('Options saved', 'success');
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('Initializing WG Access Comparator...');
  
  // Load options
  loadOptions();
  
  // Set up event listeners
  
  // Mode change
  document.getElementById('mode-select').addEventListener('change', onModeChange);
  
  // Compare button
  document.getElementById('btn-compare').addEventListener('click', onCompare);
  
  // Clear button
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  
  // Export button
  document.getElementById('btn-export').addEventListener('click', exportToCSV);
  
  // Branch checker button
  document.getElementById('btn-check-branch').addEventListener('click', checkBranchDuplicates);
  
  // Header action buttons
  document.getElementById('btn-log').addEventListener('click', () => openModal('log-modal'));
  document.getElementById('btn-options').addEventListener('click', () => openModal('options-modal'));
  document.getElementById('btn-guide').addEventListener('click', () => openModal('guide-modal'));
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      } else {
        // Find parent modal
        const modal = e.target.closest('.modal');
        if (modal) {
          closeModal(modal.id);
        }
      }
    });
  });
  
  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Options save on change
  document.querySelectorAll('#options-modal input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', saveOptions);
  });
  
  // Token count updates
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('input', () => {
      const countId = textarea.id + '-count';
      updateTokenCount(textarea.id, countId);
    });
  });
  
  // Keyboard shortcut: Ctrl/Cmd + Enter to compare
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompare();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
  
  // Initialize mode visibility
  onModeChange();
  
  // Initial token counts
  updateAllTokenCounts();
  
  console.log('✅ WG Access Comparator initialized successfully');
  logActivity('Application started');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%c WG Access Comparator ', 'background: #7c4dff; color: white; font-size: 20px; padding: 10px;');
console.log('%c Built by David Duke Essel - AQCM ', 'background: #2a2d36; color: #7c4dff; font-size: 14px; padding: 5px;');
console.log('Version: 2.0');
console.log('Features: Add, Modify, Monthly modes + Branch Checker');