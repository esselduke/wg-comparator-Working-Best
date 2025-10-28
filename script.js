/**
 * WG Access Comparator v3.0 - Application Logic
 * Built by David Duke Essel · AQCM
 * 
 * COMPLETE MULTI-SYSTEM SUPPORT:
 * - TOPS: Full matrix validation
 * - Postedge: RRRR for FUNC, no SCON
 * - Fee Aggregator: Knowledge Base requirements
 * - VPS (Global Framework): Knowledge Base requirements
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
    },
    branchCodeNotificationShown: false  // Track if notification already shown
};

// ============================================
// SYSTEM CONFIGURATIONS
// ============================================
const SYSTEMS = {
    TOPS: {
        name: 'TOPS',
        supportsModify: true,
        requiresRole: true,
        validationType: 'matrix'
    },
    Postedge: {
        name: 'Postedge',
        supportsModify: false,
        requiresRole: true,
        validationType: 'matrix',
        funcOverride: 'RRRR',
        noScon: true
    },
    FeeAggregator: {
        name: 'Fee Aggregator',
        supportsModify: false,
        requiresRole: false,
        validationType: 'knowledgeBase',
        requiredCodes: ['*WGDFAR', '*FEAGFUNC'],
        description: 'MRGN + IA codes + *FEAGFUNC'
    },
    VPS: {
        name: 'VPS (Global Framework)',
        supportsModify: false,
        requiresRole: false,
        validationType: 'knowledgeBase',
        requiredFunc: '*VPSWGFUNC',
        description: 'IA codes + *VPSWGFUNC + branch codes as MRGN'
    }
};

// ============================================
// ROLES THAT SUPPORT BRANCH CODES
// ============================================
const BRANCH_CODE_ROLES = [
    "BA & CAGE INQUIRY",
    "BA/ABM/BM ACWS INQUIRY",
    "BA/ABM/BM and Backup",
    "Branch Assistant & Cage Profile",
    "BA ABM BM AND BACKUP PROFILE",
    "INQUIRY ONLY - BRANCH ASSISTANT AND CAGE PROFILE - Secondary Role"
];

/**
 * Check if a role supports branch codes
 */
function roleSupportsBranchCodes(role) {
    return BRANCH_CODE_ROLES.includes(role);
}

/**
 * Convert 3-digit code to branch code format (*A###FC)
 */
function convertToBranchCode(code) {
    if (/^\d{3}$/.test(code)) {
        return `*A${code}FC`;
    }
    return code;
}

// ============================================
// ROLE MATRIX CONFIGURATION WITH LEVELS
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true,
      specificBase: null  // No specific requirement - any base RPTS is fine
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true,
      specificBase: null
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true,
      specificBase: null
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true,
      specificBase: null
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: [],
      baseRequired: true,
      regionalRequired: true,
      specificBase: null
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
    levels: {
      R: 1, C: 1, V: null, O: 1, I: 1, F: 2, B: 1, M: null, P: 1
    },
    rpts: {
      notes: ["Add WGBRANCH in RPTS"],
      baseRequired: true,
      regionalRequired: true,
      specificBase: "WGBRANCH"
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
 */
function parseInput(text, stripRRRR = false, role = null, system = 'TOPS') {
  if (!text || typeof text !== 'string') return [];
  
  let codes = text.split(/[\s\n\r,;]+/);
  
  codes = codes.map(code => {
    code = code.trim();
    
    if (stripRRRR && code.toUpperCase().startsWith('RRRR=')) {
      code = code.substring(5);
    }
    
    code = code.toUpperCase();
    
    // Branch code conversion for TOPS/Postedge with BA/Cage roles
    if ((system === 'TOPS' || system === 'Postedge') && role && roleSupportsBranchCodes(role)) {
      code = convertToBranchCode(code);
    }
    
    return code;
  });
  
  codes = codes.filter(code => {
    if (!code) return false;
    if (/^SNON\d+$/i.test(code)) return false;
    if (/^V0\d+/i.test(code)) return false;
    if (code.includes('@')) return false;
    return true;
  });
  
  return [...new Set(codes)];
}

/**
 * Classify a code by type
 */
function classifyCode(code) {
  code = code.toUpperCase();
  
  // Branch bundles
  if (/^\*A\d{3}FC$/i.test(code)) {
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
    '*CAGESCON', 'RRRR', '*FEAGFUNC', '*VPSWGFUNC'
  ];
  if (funcMarkers.includes(code)) {
    return 'func-scon';
  }
  
  // Default files
  if (code === '*WGDFAR') {
    return 'default-file';
  }
  
  // 3-digit codes (branch codes in VPS)
  if (/^\d{3}$/.test(code)) {
    return 'branch-code';
  }
  
  return 'ia-code';
}

/**
 * Detect if code is likely INS/MIR
 */
function detectINSMIR(code) {
  code = code.toUpperCase();
  
  // Codes starting with A, B, or R (followed by digits)
  if (/^[ABR]\d+$/i.test(code)) {
    return {
      isINSMIR: true,
      reason: 'likely INS/MIR'
    };
  }
  
  // Known INS codes
  const knownINS = ['RRU', 'A15', 'B22', 'R03', 'INS', 'MIRACLE'];
  if (knownINS.includes(code)) {
    return {
      isINSMIR: true,
      reason: 'Known INS code'
    };
  }
  
  // Contains INS or MIRACLE
  if (/INS|MIRACLE/i.test(code)) {
    return {
      isINSMIR: true,
      reason: 'Contains INS/MIRACLE'
    };
  }
  
  return { isINSMIR: false };
}

/**
 * Update token count for a textarea
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
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
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
 */
function logActivity(message) {
  if (!appState.options.logActivity) return;
  
  const timestamp = new Date().toLocaleString();
  appState.activityLog.unshift({
    time: timestamp,
    message: message
  });
  
  if (appState.activityLog.length > 50) {
    appState.activityLog = appState.activityLog.slice(0, 50);
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate matrix requirements for TOPS/Postedge
 */
function validateMatrix(addedCodes, role, system) {
  const config = ROLE_MATRIX[role];
  if (!config) {
    return { errors: [], warnings: [], details: {} };
  }
  
  const errors = [];
  const warnings = [];
  const details = {
    funcScon: { required: [], found: [], missing: [] },
    rpts: { base: null, regional: null, notes: [], specificBase: config.rpts.specificBase },
    branchBundle: { allowed: config.allowBranchBundle, found: false },
    levels: config.levels
  };
  
  // 1. Check FUNC/SCON requirements
  if (system === 'Postedge') {
    // Postedge: Check for RRRR, no SCON needed
    if (addedCodes.includes('RRRR')) {
      details.funcScon.found.push('RRRR');
    } else {
      errors.push('Missing required FUNC: RRRR (Postedge)');
    }
  } else {
    // TOPS: Normal FUNC/SCON validation
    if (config.requires.client66 && config.func_scon['66'].FUNC) {
      const requiredFunc = config.func_scon['66'].FUNC;
      const requiredScon = config.func_scon['66'].SCON;
      
      details.funcScon.required.push(requiredFunc);
      
      if (addedCodes.includes(requiredFunc)) {
        details.funcScon.found.push(requiredFunc);
        
        // SCON is auto-defaulted if FUNC is correct
        if (requiredScon) {
          details.funcScon.required.push(requiredScon);
          if (addedCodes.includes(requiredScon)) {
            details.funcScon.found.push(requiredScon);
          } else {
            // Don't error - SCON is auto-defaulted
            details.funcScon.found.push(requiredScon + ' (auto-defaulted)');
          }
        }
      } else {
        details.funcScon.missing.push(requiredFunc);
        errors.push(`Missing required FUNC: ${requiredFunc}`);
      }
    }
  }
  
  // 2. Check RPTS composition
  const rptsBase = ['WGSTD', 'WGCOMMSTD', 'WGBRANCH', 'WGCOMPL'];
  const rptsRegional = ['REGA', 'REGB', 'REGC', 'REGD', 'REGE', 'REGF', 'REGALL'];
  
  const foundBases = addedCodes.filter(code => rptsBase.includes(code));
  const foundRegional = addedCodes.find(code => rptsRegional.includes(code));
  
  // Check for duplicate base RPTS
  if (foundBases.length > 1) {
    errors.push(`Multiple base RPTS codes found: ${foundBases.join(', ')}. Only one allowed.`);
  }
  
  const foundBase = foundBases[0] || null;
  details.rpts.base = foundBase;
  details.rpts.regional = foundRegional || null;
  
  if (config.rpts.baseRequired && !foundBase) {
    if (config.rpts.specificBase) {
      errors.push(`Missing required base RPTS: ${config.rpts.specificBase}`);
    } else {
      errors.push('Missing base RPTS code (need WGSTD, WGCOMMSTD, WGBRANCH, or WGCOMPL)');
    }
  }
  
  // Check if wrong base RPTS used
  if (config.rpts.specificBase && foundBase && foundBase !== config.rpts.specificBase) {
    errors.push(`Wrong base RPTS: found ${foundBase}, but ${config.rpts.specificBase} is required for this role`);
    details.rpts.wrongBase = true;
  }
  
  if (config.rpts.regionalRequired && !foundRegional) {
    errors.push('Missing regional RPTS code (need REGA-REGF or REGALL)');
  }
  
  // Check for duplicate regional RPTS
  const foundRegionals = addedCodes.filter(code => rptsRegional.includes(code));
  if (foundRegionals.length > 1) {
    errors.push(`Multiple regional RPTS codes found: ${foundRegionals.join(', ')}. Only one allowed.`);
  }
  
  // 3. Check branch bundle restrictions
  const hasBranchBundle = addedCodes.some(code => 
    /^\*A\d{3}FC$/i.test(code)
  );
  
  details.branchBundle.found = hasBranchBundle;
  
  if (!config.allowBranchBundle && hasBranchBundle) {
    errors.push(`Role "${role}" cannot have branch bundles`);
  }
  
  // 4. Check matrix notes
  if (config.rpts.notes.length > 0) {
    details.rpts.notes = config.rpts.notes;
  }
  
  return { errors, warnings, details };
}

/**
 * Validate Fee Aggregator requirements (Knowledge Base)
 */
function validateFeeAggregator(addedCodes, requestedCodes) {
  const errors = [];
  const warnings = [];
  const details = {
    requiredCodes: ['*WGDFAR', '*FEAGFUNC'],
    found: [],
    missing: []
  };
  
  // Check for required codes
  if (addedCodes.includes('*WGDFAR')) {
    details.found.push('*WGDFAR');
  } else {
    details.missing.push('*WGDFAR');
    errors.push('Missing required MRGN: *WGDFAR');
  }
  
  if (addedCodes.includes('*FEAGFUNC')) {
    details.found.push('*FEAGFUNC');
  } else {
    details.missing.push('*FEAGFUNC');
    errors.push('Missing required FUNC: *FEAGFUNC');
  }
  
  // All IA codes should be in both requested and added
  const iaCodes = addedCodes.filter(code => classifyCode(code) === 'ia-code');
  const requestedIA = requestedCodes.filter(code => classifyCode(code) === 'ia-code');
  
  const missingIA = requestedIA.filter(code => !iaCodes.includes(code));
  if (missingIA.length > 0) {
    errors.push(`Missing requested IA codes: ${missingIA.join(', ')}`);
  }
  
  return { errors, warnings, details };
}

/**
 * Validate VPS requirements (Knowledge Base)
 */
function validateVPS(addedCodes, requestedCodes) {
  const errors = [];
  const warnings = [];
  const details = {
    requiredFunc: '*VPSWGFUNC',
    funcFound: false,
    branchCodes: [],
    mrgnCodes: []
  };
  
  // Check for *VPSWGFUNC
  if (addedCodes.includes('*VPSWGFUNC')) {
    details.funcFound = true;
  } else {
    errors.push('Missing required FUNC: *VPSWGFUNC');
  }
  
  // Check for branch bundles and corresponding MRGN
  const branchBundles = addedCodes.filter(code => /^\*A\d{3}FC$/i.test(code));
  
  if (branchBundles.length > 0) {
    branchBundles.forEach(bundle => {
      // Extract branch number (e.g., *A311FC -> 311)
      const match = bundle.match(/^\*A(\d{3})FC$/i);
      if (match) {
        const branchNum = match[1];
        details.branchCodes.push(branchNum);
        
        // Check if corresponding MRGN exists
        if (!addedCodes.includes(branchNum)) {
          errors.push(`Branch bundle ${bundle} requires MRGN: ${branchNum}`);
        } else {
          details.mrgnCodes.push(branchNum);
        }
      }
    });
  }
  
  // Check IA codes
  const iaCodes = addedCodes.filter(code => classifyCode(code) === 'ia-code');
  const requestedIA = requestedCodes.filter(code => classifyCode(code) === 'ia-code');
  
  const missingIA = requestedIA.filter(code => !iaCodes.includes(code));
  if (missingIA.length > 0) {
    errors.push(`Missing requested IA codes: ${missingIA.join(', ')}`);
  }
  
  return { errors, warnings, details };
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle system change
 */
function onSystemChange() {
  const system = document.getElementById('system-select').value;
  const systemConfig = SYSTEMS[system];
  const mode = document.getElementById('mode-select').value;
  
  // Update role visibility
  const roleGroup = document.getElementById('role-group');
  if (systemConfig.requiresRole && mode !== 'Monthly') {
    roleGroup.style.display = 'flex';
  } else {
    roleGroup.style.display = 'none';
  }
  
  // Update mode availability
  const modeSelect = document.getElementById('mode-select');
  const modifyOption = modeSelect.querySelector('option[value="Modify"]');
  
  if (!systemConfig.supportsModify) {
    modifyOption.disabled = true;
    if (mode === 'Modify') {
      modeSelect.value = 'Add';
      onModeChange();
    }
  } else {
    modifyOption.disabled = false;
  }
  
  // Update title
  const addModeTitle = document.getElementById('add-mode-title');
  if (addModeTitle) {
    addModeTitle.textContent = `Add Mode - New User (${systemConfig.name})`;
  }
  
  // Reset branch code notification
  appState.branchCodeNotificationShown = false;
  
  logActivity(`Switched to ${systemConfig.name} system`);
}

/**
 * Handle mode change
 */
function onModeChange() {
  const mode = document.getElementById('mode-select').value;
  const system = document.getElementById('system-select').value;
  const systemConfig = SYSTEMS[system];
  
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
  if (mode === 'Monthly' || !systemConfig.requiresRole) {
    roleGroup.style.display = 'none';
  } else {
    roleGroup.style.display = 'flex';
  }
}

/**
 * Clear all inputs and results
 */
function clearAll() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(ta => {
    ta.value = '';
  });
  
  updateAllTokenCounts();
  
  document.getElementById('results-section').style.display = 'none';
  
  // Reset branch code notification
  appState.branchCodeNotificationShown = false;
  
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
    ['monthly-servicenow', 'monthly-servicenow-count'],
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
  const system = document.getElementById('system-select').value;
  const role = document.getElementById('role-select').value;
  const systemConfig = SYSTEMS[system];
  
  // Validate inputs
  if (systemConfig.requiresRole && mode !== 'Monthly' && !role) {
    showToast('Please select a role', 'error');
    return;
  }
  
  if (mode === 'Monthly') {
    runMonthlyComparison();
  } else if (mode === 'Add') {
    runAddComparison(system, role);
  } else if (mode === 'Modify') {
    runModifyComparison(system, role);
  }
}

/**
 * Run Add mode comparison
 */
function runAddComparison(system, role) {
  const servicenowText = document.getElementById('add-servicenow').value;
  const reflectionText = document.getElementById('add-reflection').value;
  
  if (!servicenowText.trim()) {
    showToast('Please enter ServiceNow Request codes', 'error');
    return;
  }
  
  if (!reflectionText.trim()) {
    showToast('Please enter Reflection Added codes', 'error');
    return;
  }
  
  // Parse inputs
  const requestedCodes = parseInput(servicenowText, false, role, system);
  const addedCodes = parseInput(reflectionText, false, role, system);
  
  // Validate based on system
  let validation;
  if (system === 'TOPS' || system === 'Postedge') {
    validation = validateMatrix(addedCodes, role, system);
  } else if (system === 'FeeAggregator') {
    validation = validateFeeAggregator(addedCodes, requestedCodes);
  } else if (system === 'VPS') {
    validation = validateVPS(addedCodes, requestedCodes);
  }
  
  // Separate IA codes
  const requestedIA = requestedCodes.filter(code => {
    const type = classifyCode(code);
    return type === 'ia-code' || type === 'branch-bundle' || type === 'branch-code';
  });
  
  const addedIA = addedCodes.filter(code => {
    const type = classifyCode(code);
    return type === 'ia-code' || type === 'branch-bundle' || type === 'branch-code';
  });
  
  // Find matched, missing, and extra IA codes
  const matchedIA = requestedIA.filter(code => addedIA.includes(code));
  const missingIA = requestedIA.filter(code => !addedIA.includes(code));
  const extraIA = addedIA.filter(code => !requestedIA.includes(code));
  
  // Check for INS/MIR codes in missing AND extra
  const missingWithINS = missingIA.map(code => {
    const insCheck = detectINSMIR(code);
    return {
      code: code,
      ins: insCheck
    };
  });
  
  const extraWithINS = extraIA.map(code => {
    const insCheck = detectINSMIR(code);
    return {
      code: code,
      ins: insCheck
    };
  });
  
  // Get non-IA codes from added (matrix codes, etc.)
  const nonIACodes = addedCodes.filter(code => {
    const type = classifyCode(code);
    return type !== 'ia-code' && type !== 'branch-bundle' && type !== 'branch-code';
  });
  
  // Calculate stats
  const stats = {
    matched: matchedIA.length,
    missing: missingIA.length,
    extra: nonIACodes.length + extraIA.length,
    errors: validation.errors.length
  };
  
  // Display results
  displayAddResults({
    requestedCodes: requestedIA,
    addedCodes: addedIA,
    allAddedCodes: addedCodes,
    matched: matchedIA,
    missing: missingWithINS,
    extra: extraWithINS,
    nonIACodes: nonIACodes,
    validation: validation,
    stats: stats,
    role: role,
    system: system
  });
  
  let logMsg = `Add comparison completed for ${system}`;
  if (role) logMsg += ` - ${role}`;
  logMsg += `: ${matchedIA.length} matched, ${missingIA.length} missing`;
  
  logActivity(logMsg);
  showToast('Comparison complete', 'success');
}

/**
 * Run Modify mode comparison (TOPS only)
 */
function runModifyComparison(system, role) {
  const servicenowText = document.getElementById('modify-servicenow').value;
  const deletedText = document.getElementById('modify-deleted').value;
  const readdedText = document.getElementById('modify-readded').value;
  
  if (!servicenowText.trim() || !deletedText.trim() || !readdedText.trim()) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  // Parse inputs
  const requestedCodes = parseInput(servicenowText, false, role, system);
  const deletedCodes = parseInput(deletedText, false, role, system);
  const readdedCodes = parseInput(readdedText, false, role, system);
  
  // Check what was not re-added
  const notReadded = deletedCodes.filter(code => !readdedCodes.includes(code));
  
  // Check if requested codes are in re-added
  const requestedInReadded = requestedCodes.filter(code => readdedCodes.includes(code));
  const requestedNotInReadded = requestedCodes.filter(code => !readdedCodes.includes(code));
  
  // Validate matrix requirements on final re-added codes
  const validation = validateMatrix(readdedCodes, role, system);
  
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
    role: role,
    system: system
  });
  
  logActivity(`Modify comparison completed for ${role}: ${notReadded.length} not re-added`);
  showToast('Comparison complete', 'success');
}

/**
 * Run Monthly mode comparison
 */
function runMonthlyComparison() {
  const excelText = document.getElementById('monthly-excel').value;
  const servicenowText = document.getElementById('monthly-servicenow').value;
  
  if (!excelText.trim() || !servicenowText.trim()) {
    showToast('Please fill both fields', 'error');
    return;
  }
  
  // Parse inputs (strip RRRR= from Excel)
  const excelCodes = parseInput(excelText, true);
  const servicenowCodes = parseInput(servicenowText, false);
  
  // Find matches (codes in both lists)
  const matches = excelCodes.filter(code => servicenowCodes.includes(code));
  
  // Display results
  displayMonthlyResults(excelCodes, servicenowCodes, matches);
  
  logActivity(`Monthly comparison completed: ${matches.length} matches found`);
  showToast('Comparison complete', 'success');
}

/**
 * Run branch code duplicate check
 */
function checkBranchDuplicates() {
  const branchText = document.getElementById('branch-bundle-codes').value;
  const checkText = document.getElementById('codes-to-check').value;
  
  if (!branchText.trim() || !checkText.trim()) {
    showToast('Please fill both fields', 'error');
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

// ============================================
// DISPLAY FUNCTIONS
// ============================================

/**
 * Display Add mode results
 */
function displayAddResults(results) {
  const { requestedCodes, addedCodes, allAddedCodes, matched, missing, extra, nonIACodes, validation, stats, role, system } = results;
  
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
  
  // Update requirements title based on system
  const reqTitle = document.getElementById('requirements-title');
  if (system === 'TOPS' || system === 'Postedge') {
    reqTitle.textContent = '💡 Matrix Requirements Validation';
  } else {
    reqTitle.textContent = '💡 Knowledge Base Requirements Validation';
  }
  
  // Render side-by-side comparison
  renderSideBySideComparison(requestedCodes, allAddedCodes, matched, missing, extra, role, system, validation);
  
  // Render validation details
  if (system === 'TOPS' || system === 'Postedge') {
    renderMatrixValidation(validation, role, system, 'requirements-validation-details');
  } else if (system === 'FeeAggregator') {
    renderFeeAggregatorValidation(validation, 'requirements-validation-details');
  } else if (system === 'VPS') {
    renderVPSValidation(validation, 'requirements-validation-details');
  }
  
  // Render errors and warnings
  renderErrorsAndWarnings(validation.errors, validation.warnings, 'validation-errors', 'warnings-list');
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display Modify mode results
 */
function displayModifyResults(results) {
  const { deletedCodes, readdedCodes, requestedCodes, notReadded, requestedInReadded, requestedNotInReadded, validation, stats, role, system } = results;
  
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
  renderMatrixValidation(validation, role, system, 'requirements-validation-details-modify');
  
  // Render errors and warnings
  renderErrorsAndWarnings(validation.errors, validation.warnings, 'validation-errors-modify', 'warnings-list-modify');
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display Monthly mode results
 */
function displayMonthlyResults(excelCodes, servicenowCodes, matches) {
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
    
    if (matches.includes(code)) {
      item.classList.add('matched');
    }
    
    item.textContent = code;
    excelList.appendChild(item);
  });
  
  // Render ServiceNow codes
  const servicenowList = document.getElementById('servicenow-codes-list');
  servicenowList.innerHTML = '';
  
  servicenowCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    if (matches.includes(code)) {
      item.classList.add('matched');
    }
    
    item.textContent = code;
    servicenowList.appendChild(item);
  });
  
  // Render summary
  const summaryText = document.getElementById('monthly-summary-text');
  
  const excelOnly = excelCodes.filter(code => !servicenowCodes.includes(code));
  const servicenowOnly = servicenowCodes.filter(code => !excelCodes.includes(code));
  
  summaryText.innerHTML = `
    <p><strong>Total Excel Codes:</strong> ${excelCodes.length}</p>
    <p><strong>Total ServiceNow Codes:</strong> ${servicenowCodes.length}</p>
    <p><strong>Matched (Green):</strong> ${matches.length}</p>
    <p><strong>Excel Only:</strong> ${excelOnly.length}</p>
    <p><strong>ServiceNow Only:</strong> ${servicenowOnly.length}</p>
  `;
  
  // Scroll to results
  if (appState.options.autoScroll) {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Display branch checker results
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
function renderSideBySideComparison(requestedCodes, addedCodes, matched, missing, extra, role, system, validation) {
  const requestedList = document.getElementById('requested-codes-list');
  const addedList = document.getElementById('added-codes-list');
  
  requestedList.innerHTML = '';
  addedList.innerHTML = '';
  
  // Render requested codes
  requestedCodes.forEach(code => {
    const item = document.createElement('div');
    item.className = 'vertical-code-item';
    
    const insCheck = detectINSMIR(code);
    
    if (matched.includes(code)) {
      item.classList.add('matched');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✓ Added</span>`;
    } else {
      item.classList.add('missing');
      
      if (insCheck.isINSMIR) {
        item.classList.add('ins-warning');
        item.innerHTML = `
          <span>${code}</span>
          <span style="font-size: 0.75rem;">
            <span class="code-badge">INS/MIR</span>
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
    const insCheck = detectINSMIR(code);
    
    if (requestedCodes.includes(code)) {
      item.classList.add('matched');
      item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✓ Requested</span>`;
    } else {
      // Not requested - check if it's a matrix requirement or truly extra
      const isMatrixReq = isRequiredByMatrixOrKB(code, system, validation);
      
      // Check if wrong RPTS
      const isWrongRPTS = validation.details && validation.details.rpts && 
                          validation.details.rpts.wrongBase && 
                          validation.details.rpts.base === code;
      
      if (isWrongRPTS) {
        item.classList.add('wrong-rpts');
        item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">⚠️ Wrong RPTS</span>`;
      } else if (isMatrixReq) {
        item.classList.add('matrix-req');
        item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">Matrix Req</span>`;
      } else {
        // Truly extra (not requested, not required)
        item.classList.add('extra');
        
        if (insCheck.isINSMIR) {
          item.innerHTML = `
            <span>${code}</span>
            <span style="font-size: 0.75rem;">
              <span class="code-badge">INS/MIR</span>
              ${insCheck.reason}
            </span>
          `;
        } else {
          item.innerHTML = `<span>${code}</span><span style="font-size: 0.75rem;">✗ Extra</span>`;
        }
      }
    }
    
    addedList.appendChild(item);
  });
  
  // Add branch code conversion note (ONLY ONCE)
  if ((system === 'TOPS' || system === 'Postedge') && role && roleSupportsBranchCodes(role) && !appState.branchCodeNotificationShown) {
    const note = document.createElement('div');
    note.style.marginTop = '1rem';
    note.style.padding = '0.5rem';
    note.style.backgroundColor = 'rgba(124, 77, 255, 0.1)';
    note.style.border = '1px solid var(--color-accent)';
    note.style.borderRadius = 'var(--radius-sm)';
    note.style.fontSize = '0.875rem';
    note.style.color = 'var(--color-accent)';
    note.innerHTML = '💡 3-digit branch codes automatically converted to *A###FC format for this role';
    
    requestedList.parentElement.parentElement.insertBefore(note, requestedList.parentElement);
    
    appState.branchCodeNotificationShown = true;
  }
}

/**
 * Check if code is required by matrix or knowledge base
 */
function isRequiredByMatrixOrKB(code, system, validation) {
  const codeType = classifyCode(code);
  
  // FUNC/SCON
  if (codeType === 'func-scon') {
    if (validation.details && validation.details.funcScon) {
      return validation.details.funcScon.required.includes(code) || 
             validation.details.funcScon.found.includes(code);
    }
    return true;
  }
  
  // RPTS (but not wrong RPTS)
  if (codeType === 'rpts-base' || codeType === 'rpts-regional') {
    if (validation.details && validation.details.rpts) {
      // Don't mark as matrix req if it's the wrong base
      if (validation.details.rpts.wrongBase && validation.details.rpts.base === code) {
        return false;
      }
    }
    return true;
  }
  
  // Default file/MRGN
  if (codeType === 'default-file') {
    return true;
  }
  
  // Fee Aggregator specific
  if (system === 'FeeAggregator') {
    if (code === '*WGDFAR' || code === '*FEAGFUNC') {
      return true;
    }
  }
  
  // VPS specific
  if (system === 'VPS') {
    if (code === '*VPSWGFUNC') {
      return true;
    }
    // Branch codes as MRGN
    if (codeType === 'branch-code') {
      return true;
    }
  }
  
  return false;
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
      item.classList.add('matrix-req');
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
 * Render matrix validation details with LEVELS
 */
function renderMatrixValidation(validation, role, system, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  const config = ROLE_MATRIX[role];
  if (!config) return;
  
  let html = `<div style="display: grid; gap: 1rem;">`;
  
  // Matrix Levels
  if (config.levels) {
    html += `<div>
      <h4 style="color: var(--color-accent); margin-bottom: 0.5rem;">Matrix Levels:</h4>
      <div style="background-color: var(--color-bg-primary); padding: 0.75rem; border-radius: var(--radius-sm); font-family: var(--font-family-mono); font-size: 0.875rem;">
        <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 0.5rem; text-align: center;">
          <div><strong>R</strong><br>${config.levels.R !== null ? config.levels.R : 'null'}</div>
          <div><strong>C</strong><br>${config.levels.C !== null ? config.levels.C : 'null'}</div>
          <div><strong>V</strong><br>${config.levels.V !== null ? config.levels.V : 'null'}</div>
          <div><strong>O</strong><br>${config.levels.O !== null ? config.levels.O : 'null'}</div>
          <div><strong>I</strong><br>${config.levels.I !== null ? config.levels.I : 'null'}</div>
          <div><strong>F</strong><br>${config.levels.F !== null ? config.levels.F : 'null'}</div>
          <div><strong>B</strong><br>${config.levels.B !== null ? config.levels.B : 'null'}</div>
          <div><strong>M</strong><br>${config.levels.M !== null ? config.levels.M : 'null'}</div>
          <div><strong>P</strong><br>${config.levels.P !== null ? config.levels.P : 'null'}</div>
        </div>
      </div>
    </div>`;
  }
  
  // FUNC/SCON
  if (system === 'Postedge') {
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Postedge FUNC/SCON:</h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="vertical-code-item ${validation.details.funcScon.found.includes('RRRR') ? 'matched' : 'missing'}">
          RRRR ${validation.details.funcScon.found.includes('RRRR') ? '✓' : '✗'}
        </span>
        <span class="vertical-code-item matched">No SCON required ✓</span>
      </div>
    </div>`;
  } else if (validation.details.funcScon.required.length > 0) {
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">FUNC/SCON Requirements:</h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
    
    validation.details.funcScon.required.forEach(code => {
      const found = validation.details.funcScon.found.includes(code) || 
                    validation.details.funcScon.found.includes(code + ' (auto-defaulted)');
      const className = found ? 'matched' : 'missing';
      const icon = found ? '✓' : '✗';
      const label = code.includes('SCON') && found && !validation.details.funcScon.found.includes(code) ? 
                    ' (auto-defaulted)' : '';
      html += `<span class="vertical-code-item ${className}">${code}${label} ${icon}</span>`;
    });
    
    html += `</div></div>`;
  }
  
  // RPTS
  html += `<div>
    <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">RPTS Requirements:</h4>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
  
  if (validation.details.rpts.base) {
    const isWrong = validation.details.rpts.wrongBase;
    const className = isWrong ? 'wrong-rpts' : 'matched';
    const icon = isWrong ? '⚠️ Wrong' : '✓';
    html += `<span class="vertical-code-item ${className}">${validation.details.rpts.base} ${icon} Base</span>`;
    
    if (isWrong && validation.details.rpts.specificBase) {
      html += `<span class="vertical-code-item missing">Required: ${validation.details.rpts.specificBase} ✗</span>`;
    }
  } else {
    if (validation.details.rpts.specificBase) {
      html += `<span class="vertical-code-item missing">${validation.details.rpts.specificBase} required ✗</span>`;
    } else {
      html += `<span class="vertical-code-item missing">Missing Base RPTS (WGSTD preferred) ✗</span>`;
    }
  }
  
  if (validation.details.rpts.regional) {
    html += `<span class="vertical-code-item matched">${validation.details.rpts.regional} ✓ Regional</span>`;
  } else {
    html += `<span class="vertical-code-item missing">Missing Regional RPTS ✗</span>`;
  }
  
  html += `</div></div>`;
  
  // Branch Bundle
  if (validation.details.branchBundle) {
    const allowed = validation.details.branchBundle.allowed;
    const found = validation.details.branchBundle.found;
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Branch Bundle:</h4>
      <span class="vertical-code-item ${allowed ? 'matrix-req' : 'extra'}">
        ${allowed ? 'Allowed' : 'Not Allowed'} ${found ? '(Found)' : '(Not found)'}
      </span>
    </div>`;
  }
  
  html += `</div>`;
  
  container.innerHTML = html;
}

/**
 * Render Fee Aggregator validation
 */
function renderFeeAggregatorValidation(validation, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  let html = `<div style="display: grid; gap: 1rem;">`;
  
  html += `<div>
    <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Knowledge Base Requirements:</h4>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
  
  validation.details.requiredCodes.forEach(code => {
    const found = validation.details.found.includes(code);
    const className = found ? 'matched' : 'missing';
    const icon = found ? '✓' : '✗';
    html += `<span class="vertical-code-item ${className}">${code} ${icon}</span>`;
  });
  
  html += `</div>
    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
      Fee Aggregator requires: MRGN (*WGDFAR) + IA codes + *FEAGFUNC
    </p>
  </div>`;
  
  html += `</div>`;
  
  container.innerHTML = html;
}

/**
 * Render VPS validation
 */
function renderVPSValidation(validation, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  let html = `<div style="display: grid; gap: 1rem;">`;
  
  html += `<div>
    <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Knowledge Base Requirements:</h4>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
  
  const funcFound = validation.details.funcFound;
  html += `<span class="vertical-code-item ${funcFound ? 'matched' : 'missing'}">
    ${validation.details.requiredFunc} ${funcFound ? '✓' : '✗'}
  </span>`;
  
  html += `</div>
    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
      VPS requires: IA codes + *VPSWGFUNC + branch codes as MRGN
    </p>
  </div>`;
  
  // Branch codes and MRGN
  if (validation.details.branchCodes.length > 0) {
    html += `<div>
      <h4 style="color: var(--color-info); margin-bottom: 0.5rem;">Branch Codes & MRGN Mapping:</h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
    
    validation.details.branchCodes.forEach(branchCode => {
      const hasMrgn = validation.details.mrgnCodes.includes(branchCode);
      const className = hasMrgn ? 'matched' : 'missing';
      html += `<span class="vertical-code-item ${className}">
        *A${branchCode}FC → ${branchCode} MRGN ${hasMrgn ? '✓' : '✗'}
      </span>`;
    });
    
    html += `</div></div>`;
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

// ============================================
// MATRIX GUIDE FUNCTIONS
// ============================================

/**
 * Update matrix guide display when role is selected
 */
function updateMatrixGuide() {
  const role = document.getElementById('matrix-role-select').value;
  const detailsDiv = document.getElementById('matrix-details');
  
  if (!role) {
    detailsDiv.innerHTML = '<p class="empty-state">Select a role to view requirements</p>';
    return;
  }
  
  const config = ROLE_MATRIX[role];
  if (!config) {
    detailsDiv.innerHTML = '<p class="empty-state">No configuration found for this role</p>';
    return;
  }
  
  let html = '';
  
  // Matrix Levels
  if (config.levels) {
    html += `<div class="matrix-section">
      <h3>Matrix Levels</h3>
      <div style="background-color: var(--color-bg-primary); padding: 1rem; border-radius: var(--radius-sm); font-family: var(--font-family-mono);">
        <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 0.75rem; text-align: center; font-size: 0.9rem;">
          <div><strong style="color: var(--color-accent);">R</strong><br><span style="color: var(--color-text-primary);">${config.levels.R !== null ? config.levels.R : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">C</strong><br><span style="color: var(--color-text-primary);">${config.levels.C !== null ? config.levels.C : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">V</strong><br><span style="color: var(--color-text-primary);">${config.levels.V !== null ? config.levels.V : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">O</strong><br><span style="color: var(--color-text-primary);">${config.levels.O !== null ? config.levels.O : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">I</strong><br><span style="color: var(--color-text-primary);">${config.levels.I !== null ? config.levels.I : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">F</strong><br><span style="color: var(--color-text-primary);">${config.levels.F !== null ? config.levels.F : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">B</strong><br><span style="color: var(--color-text-primary);">${config.levels.B !== null ? config.levels.B : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">M</strong><br><span style="color: var(--color-text-primary);">${config.levels.M !== null ? config.levels.M : 'null'}</span></div>
          <div><strong style="color: var(--color-accent);">P</strong><br><span style="color: var(--color-text-primary);">${config.levels.P !== null ? config.levels.P : 'null'}</span></div>
        </div>
      </div>
    </div>`;
  }
  
  // Role Requirements
  html += `<div class="matrix-section">
    <h3>Role Requirements</h3>
    <p>Client 66 ${config.requires.client66 ? 'required' : 'not required'}</p>
    <p>Client 72 ${config.requires.client72 ? 'required' : 'not required'}</p>
  </div>`;
  
  // FUNC/SCON Configuration
  html += `<div class="matrix-section">
    <h3>FUNC/SCON Configuration</h3>`;
  
  if (config.func_scon['66'].FUNC) {
    html += `<table class="matrix-table">
      <thead>
        <tr>
          <th>Client</th>
          <th>FUNC</th>
          <th>SCON</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>66</td>
          <td><code>${config.func_scon['66'].FUNC}</code></td>
          <td><code>${config.func_scon['66'].SCON || 'Auto-defaulted'}</code></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">SCON auto-defaults when correct FUNC is added</p>`;
  } else {
    html += `<p>No FUNC/SCON requirements for this role</p>`;
  }
  
  html += `</div>`;
  
  // FILE/MRGN Defaults
  html += `<div class="matrix-section">
    <h3>FILE/MRGN Defaults</h3>
    <p>FILE: <code>${config.defaults.FILE}</code> (Defaulted)</p>
    <p>MRGN: <code>${config.defaults.MRGN}</code> (Defaulted)</p>
  </div>`;
  
  // RPTS Requirements
  html += `<div class="matrix-section">
    <h3>RPTS Requirements</h3>`;
  
  if (config.rpts.specificBase) {
    html += `<p><strong>Required Base:</strong> <code>${config.rpts.specificBase}</code></p>`;
  } else {
    html += `<h4>Base RPTS (choose one):</h4>
    <ul>
      <li><code>WGSTD</code> (most common)</li>
      <li><code>WGCOMMSTD</code></li>
      <li><code>WGBRANCH</code></li>
      <li><code>WGCOMPL</code></li>
    </ul>`;
  }
  
  html += `<h4>Regional (choose one):</h4>
    <ul>
      <li><code>REGA</code>, <code>REGB</code>, <code>REGC</code>, <code>REGD</code>, <code>REGE</code>, <code>REGF</code>, <code>REGALL</code></li>
    </ul>`;
  
  if (config.allowBranchBundle) {
    html += `<p><strong>Note:</strong> Branch bundles (*A###FC) allowed with corresponding BRX codes</p>`;
  }
  
  if (config.rpts.notes.length > 0) {
    html += `<h4>Additional notes:</h4><ul>`;
    config.rpts.notes.forEach(note => {
      html += `<li>${note}</li>`;
    });
    html += `</ul>`;
  }
  
  html += `</div>`;
  
  // Cheque Writing
  html += `<div class="matrix-section">
    <h3>Cheque Writing</h3>`;
  
  if (config.chequeWriting.allowed) {
    html += `<p>Cheque writing <strong style="color: var(--color-success);">allowed</strong> for this role</p>
    <p>Department: <code>${config.chequeWriting.dept}</code></p>
    <p>Range: <code>${config.chequeWriting.range}</code></p>`;
  } else {
    html += `<p style="color: var(--color-error);">Cheque writing <strong>not allowed</strong> for this role</p>`;
  }
  
  html += `</div>`;
  
  // Branch Code Support
  if (roleSupportsBranchCodes(role)) {
    html += `<div class="matrix-section">
      <h3>Branch Code Support</h3>
      <p style="color: var(--color-accent);">✓ This role supports automatic branch code conversion</p>
      <p>3-digit codes (e.g., <code>417</code>) automatically convert to <code>*A417FC</code> format</p>
    </div>`;
  }
  
  // Additional Notes
  html += `<div class="matrix-section">
    <h3>Additional Notes</h3>
    <p>• Branch bundles ${config.allowBranchBundle ? '<span style="color: var(--color-success);">allowed</span>' : '<span style="color: var(--color-error);">not allowed</span>'} for this role</p>
    <p>• Only ONE base RPTS allowed (no duplicates)</p>
    <p>• Only ONE regional RPTS allowed (no duplicates)</p>
  </div>`;
  
  detailsDiv.innerHTML = html;
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Open modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    
    if (modalId === 'log-modal') {
      updateLogModal();
    }
  }
}

/**
 * Close modal
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
    const requestedItems = document.querySelectorAll('#requested-codes-list .vertical-code-item');
    requestedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Requested', code, 'Matched', 'Code was added']);
      } else if (item.classList.contains('ins-warning')) {
        rows.push(['Requested', code, 'Missing', 'INS/MIR CODE - Not added']);
      } else {
        rows.push(['Requested', code, 'Missing', 'Not added']);
      }
    });
    
    const addedItems = document.querySelectorAll('#added-codes-list .vertical-code-item');
    addedItems.forEach(item => {
      const text = item.textContent;
      const code = text.split(' ')[0];
      
      if (item.classList.contains('matched')) {
        rows.push(['Added', code, 'Matched', 'Requested']);
      } else if (item.classList.contains('matrix-req')) {
        rows.push(['Added', code, 'Matrix Req', 'Required by matrix']);
      } else if (item.classList.contains('wrong-rpts')) {
        rows.push(['Added', code, 'Wrong RPTS', 'Incorrect base RPTS']);
      } else if (item.classList.contains('extra')) {
        rows.push(['Added', code, 'Extra', 'Not requested, not required']);
      }
    });
  } else if (mode === 'Modify') {
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
  
  const errorItems = document.querySelectorAll('.error-item');
  errorItems.forEach(item => {
    rows.push(['Error', '', '', item.textContent]);
  });
  
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
  const rows = [['Excel Codes', 'ServiceNow Codes', 'Status']];
  
  const excelItems = document.querySelectorAll('#excel-codes-list .vertical-code-item');
  const servicenowItems = document.querySelectorAll('#servicenow-codes-list .vertical-code-item');
  
  const maxLength = Math.max(excelItems.length, servicenowItems.length);
  
  for (let i = 0; i < maxLength; i++) {
    const excelCode = i < excelItems.length ? excelItems[i].textContent : '';
    const servicenowCode = i < servicenowItems.length ? servicenowItems[i].textContent : '';
    
    let status = '';
    if (excelCode && servicenowCode && 
        excelItems[i].classList.contains('matched') && 
        servicenowItems[i].classList.contains('matched')) {
      status = 'Matched';
    } else if (excelCode && !servicenowCode) {
      status = 'Excel Only';
    } else if (!excelCode && servicenowCode) {
      status = 'ServiceNow Only';
    }
    
    rows.push([excelCode, servicenowCode, status]);
  }
  
  downloadCSV(rows, 'wg-monthly-comparison.csv');
}

/**
 * Download CSV file
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
  console.log('Initializing WG Access Comparator v3.0...');
  
  // Load options
  loadOptions();
  
  // Set up event listeners
  
  // System change
  document.getElementById('system-select').addEventListener('change', onSystemChange);
  
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
  document.getElementById('btn-matrix').addEventListener('click', () => openModal('matrix-modal'));
  document.getElementById('btn-options').addEventListener('click', () => openModal('options-modal'));
  document.getElementById('btn-guide').addEventListener('click', () => openModal('guide-modal'));
  
  // Matrix role selector
  document.getElementById('matrix-role-select').addEventListener('change', updateMatrixGuide);
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      } else {
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
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompare();
    }
    
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
  
  // Initialize mode visibility
  onSystemChange();
  onModeChange();
  
  // Initial token counts
  updateAllTokenCounts();
  
  console.log('✅ WG Access Comparator v3.0 initialized successfully');
  console.log('✨ Multi-System Support: TOPS, Postedge, Fee Aggregator, VPS');
  console.log('✨ New Features: INS/MIR detection, Wrong RPTS highlighting, Matrix Levels, SCON auto-default');
  logActivity('Application started - v3.0 Multi-System');
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
console.log('%c WG Access Comparator v3.0 ', 'background: #7c4dff; color: white; font-size: 20px; padding: 10px;');
console.log('%c Built by David Duke Essel - AQCM ', 'background: #2a2d36; color: #7c4dff; font-size: 14px; padding: 5px;');
console.log('Version: 3.0 - Multi-System Edition');
console.log('Systems: TOPS, Postedge, Fee Aggregator, VPS (Global Framework)');
console.log('Features:');
console.log('  • Branch code conversion (3-digit → *A###FC)');
console.log('  • INS/MIR detection with yellow badges');
console.log('  • Wrong RPTS highlighting');
console.log('  • Matrix Levels display (R C V O I F B M P)');
console.log('  • SCON auto-default (no error if FUNC correct)');
console.log('  • RPTS duplicate detection');
console.log('  • Monthly audit: Excel → ServiceNow comparison');
console.log('  • Knowledge Base validation for Fee Aggregator & VPS');