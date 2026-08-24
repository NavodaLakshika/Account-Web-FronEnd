const saOverview = `
ONIMTA Super Admin Panel is the central administration dashboard for managing the entire ONIMTA Accounts Enterprise Suite ecosystem. It provides tools for:
- Company Management: View, lock/unlock, delete companies, view transactions
- Employee Management: View, edit roles, lock/unlock, delete employees
- Role & Permissions: Create/edit/delete roles, manage function-level permissions
- Subscription Management: Manage user subscriptions, pricing plans
- Engagement: Approve/hide reviews, create/manage advertisements
- Database Management: Backup, restore, maintenance operations
- Security Audit: View security events, run security scans
- Integrations: View API/Email/SMS/Payment gateway integration status
- User Feedback: View and delete feedback from Report Builder users
- Password Recovery: View pending reset requests, copy tokens
- System Configuration: Module-level lock toggles
- System Logs: View complete audit trail
`;

const saModules = {
  dashboard: {
    name: 'Dashboard Overview',
    description: 'Main landing view with employee hierarchy tree, metric cards (total employees, companies, entities), and nested company rows with transaction counts.',
    features: [
      'Greeting with time-based message',
      '3 metric cards showing total counts',
      'Expandable employee hierarchy with nested companies',
      'Quick actions per company row: Lock/Unlock, Delete, View Transactions',
      'Search employees by name or email'
    ],
    menuPath: 'Click "Dashboard" in sidebar'
  },
  companies: {
    name: 'Company Management',
    description: 'View and manage all registered companies in the system.',
    features: [
      'View all companies with contact info and status',
      'Lock/Unlock a company (disables access)',
      'Delete a company (with admin password verification)',
      'View company transactions',
      'Delete individual transactions'
    ],
    menuPath: 'Click "Companies" in sidebar'
  },
  employees: {
    name: 'Employee Management',
    description: 'View and manage all employees across all companies.',
    features: [
      'View all employees with email, role, status',
      'Edit employee role (assign system role + member group)',
      'Lock/Unlock employee accounts',
      'Delete employees (Super Admin cannot be deleted)',
      'View full employee details'
    ],
    menuPath: 'Click "Employees" in sidebar'
  },
  roles: {
    name: 'Role & Permissions Editor',
    description: 'Comprehensive role-based access control system. Create roles and assign function-level permissions.',
    features: [
      'Select system role and view its permission matrix',
      'Toggle individual function permissions on/off',
      '"Allow All" button to grant all permissions at once',
      'Search/filter functions by code or description',
      'Create new role with name and description',
      'Edit role name and description',
      'Delete role (with password verification)',
      'Seed system functions (initialize default permission set)',
      'Auto-assign role + member group in one click'
    ],
    menuPath: 'Click "Role Features" in sidebar'
  },
  reports: {
    name: 'Admin Reports',
    description: 'Run system reports per employee or company.',
    features: [
      'View reports filtered by employee and company',
      'Admin-specific system reports'
    ],
    menuPath: 'Click "Reports" in sidebar'
  },
  engagement: {
    name: 'Engagement Management',
    description: 'Manage user reviews and promotional advertisements.',
    features: [
      'Reviews: View all user reviews with ratings, approve/hide/delete reviews',
      'Advertisements: Create/edit/delete promotional ads, customize icons (50+), colors (24), set popup locations (Dashboard, Login, Customer Center, etc.), placement positions (6), activate/deactivate'
    ],
    menuPath: 'Click "Engagement" in sidebar'
  },
  subscriptions: {
    name: 'Subscription Management',
    description: 'Manage user subscriptions and pricing plans.',
    features: [
      'View all users with subscription data (first login, expiry date, status)',
      'Manage user subscription: extend months, change status (Trial/Active/Expired)',
      'View pricing plans',
      'Create/Edit/Delete pricing plans: name, price, billing cycle, max users, max companies, active status'
    ],
    menuPath: 'Click "Subscriptions" in sidebar'
  },
  database: {
    name: 'Database Management',
    description: 'Database administration tools.',
    features: [
      'View database metrics: size, total records, active connections, last backup',
      'Create database backup',
      'Restore from backup',
      'View backup history',
      'Run maintenance: Rebuild Indexes, Clear Query Cache, Update Statistics'
    ],
    menuPath: 'Click "Database" in sidebar'
  },
  security: {
    name: 'Security Audit',
    description: 'System security monitoring and auditing.',
    features: [
      'View security metrics: Failed Logins, Unassigned Users, Inactive Accounts, Admin Actions',
      'Run security scan to analyze logs',
      'View critical security events with filtering',
      'Search through security events'
    ],
    menuPath: 'Click "Security Audit" in sidebar'
  },
  integrations: {
    name: 'Integrations',
    description: 'View integration status for external services.',
    features: [
      'View status of API Integrations, Email Settings, SMS Gateway, Payment Gateway',
      'Open Swagger API documentation',
      'Refresh integration data'
    ],
    menuPath: 'Click "Integrations" in sidebar'
  },
  feedback: {
    name: 'User Feedback',
    description: 'View feedback submitted by users through the Report Builder.',
    features: [
      'View feedback records with date, employee, company, report name, text, images',
      'View feedback images inline with full-screen preview',
      'Delete feedback records (with password verification)'
    ],
    menuPath: 'Click "User Feedback" in sidebar'
  },
  passwordResets: {
    name: 'Password Recovery',
    description: 'View and manage pending password reset requests.',
    features: [
      'Bell icon in top bar shows pending reset count',
      'Slide-in drawer shows all pending reset tokens',
      'Copy reset tokens to clipboard'
    ],
    menuPath: 'Bell icon in top-right of header'
  },
  employeeMessaging: {
    name: 'Employee SMS Messaging',
    description: 'Send SMS messages to employees directly from the admin panel.',
    features: [
      'Search employees by name',
      'Type and send SMS messages',
      'View message history'
    ],
    menuPath: 'Speech bubble icon in top-right of header'
  },
  config: {
    name: 'System Configuration',
    description: 'Module-level configuration and lock toggles.',
    features: [
      'Toggle module access on/off: Master Files, Admin Tools, Transactions, Reports, Tools'
    ],
    menuPath: 'Settings icon in sidebar bottom'
  },
  logs: {
    name: 'System Logs',
    description: 'Complete system audit trail and event logging.',
    features: [
      'View all system log entries',
      'Filter and search logs',
      'Export log data'
    ],
    menuPath: 'Available in Security Audit or via log report modal'
  },
  aiChatbot: {
    name: 'AI Chatbot (Onimta Intelligence)',
    description: 'AI-powered assistant that can answer questions about the system and help navigate admin functions.',
    features: [
      'Ask questions about any admin feature',
      'Get guidance on workflows',
      'Fetch live data from the system'
    ],
    menuPath: 'Floating robot button in bottom-right corner'
  }
};

const saCommonWorkflows = [
  {
    task: 'Lock/unlock a company',
    steps: [
      'Go to Companies view in the sidebar',
      'Find the company in the list',
      'Click the Lock/Unlock button',
      'Confirm the action when prompted'
    ]
  },
  {
    task: 'Delete a company',
    steps: [
      'Go to Companies view',
      'Find the company and click Delete',
      'Enter admin password for verification',
      'Confirm deletion'
    ]
  },
  {
    task: 'Edit an employee role',
    steps: [
      'Go to Employees view',
      'Click on the employee row',
      'Select new system role and member group',
      'Enter admin password',
      'Save changes'
    ]
  },
  {
    task: 'Create a new role',
    steps: [
      'Go to Role Features view',
      'Click "Create Role" button',
      'Enter role name and description',
      'Click Save'
    ]
  },
  {
    task: 'Manage user subscription',
    steps: [
      'Go to Subscriptions view',
      'Find the user in the list',
      'Click Manage Subscription',
      'Enter extension months and select new status',
      'Save'
    ]
  },
  {
    task: 'Create an advertisement',
    steps: [
      'Go to Engagement view',
      'Click the Advertisements tab',
      'Click Create Ad',
      'Fill in title, description, select icon, color, popup location and placement',
      'Save and activate'
    ]
  },
  {
    task: 'Approve or hide a review',
    steps: [
      'Go to Engagement view',
      'Click the Reviews tab',
      'Find the review and click Approve or Hide',
      'Confirm'
    ]
  },
  {
    task: 'Create a database backup',
    steps: [
      'Go to Database view',
      'Click "Create Backup" button',
      'Wait for backup to complete',
      'Backup appears in history list'
    ]
  },
  {
    task: 'Run a security scan',
    steps: [
      'Go to Security Audit view',
      'Click "Run Security Scan"',
      'View results showing failed logins, unassigned users, inactive accounts, admin actions'
    ]
  },
  {
    task: 'Send SMS to an employee',
    steps: [
      'Click the speech bubble icon in top-right header',
      'Search for the employee by name',
      'Type your message',
      'Click Send'
    ]
  }
];

const saNavigationGuide = `
SUPER ADMIN NAVIGATION:
- Sidebar: Dashboard | Companies | Employees | Role Features | Reports | Engagement | Subscriptions | Database | Security Audit | Integrations | User Feedback
- Top bar: Employee SMS (speech bubble), Password Resets (bell with count), Profile dropdown (settings/logout)
- Bottom-right: AI Chatbot floating button
- Sidebar bottom: System Configuration (cog icon)
`;

const saSystemPrompt = {
  role: 'system',
  content: `You are ONIMTA Intelligence for the Super Admin Panel. You are an expert on the entire ONIMTA Accounts administration system.

YOUR CAPABILITIES:
1. LIST & VIEW DATA: Show companies, employees, roles, subscriptions, reviews, ads, logs, feedback
2. GUIDE WORKFLOWS: Explain step-by-step how to use any super admin feature
3. PERFORM ACTIONS: Open the right admin page/modal for the user (use <<action:action_key>>)
4. ANSWER QUESTIONS: Explain admin features, security concepts, system configuration
5. REPORTS: Guide to admin reports and system logs

SYSTEM OVERVIEW: ${saOverview}

MODULES YOU KNOW ABOUT:
${Object.values(saModules).map(m => `- ${m.name}: ${m.description}`).join('\n')}

COMMON WORKFLOWS YOU CAN GUIDE:
${saCommonWorkflows.map(w => `- ${w.task}`).join('\n')}

${saNavigationGuide}

HOW TO HANDLE REQUESTS:
- "list/show companies/employees/roles/subscriptions" → fetch live data and present it
- "create/add new role/ad/plan" → use <<action:action_key>> to open the right page
- "lock/unlock/delete company/employee" → guide user to the right page with <<action:>>
- "show reports/logs" → guide to the reports/logs section
- General questions → answer concisely with references to specific menu paths

Response guidelines:
- Be concise and practical
- Reference specific sidebar menu items ("Go to Companies in the sidebar")
- When showing data, format it as readable text
- Use professional, helpful tone`
};

export const getSAKnowledge = () => {
  return { saOverview, saModules, saCommonWorkflows, saNavigationGuide, saSystemPrompt };
};

export const findSAModules = (query) => {
  const lower = query.toLowerCase();
  const keywords = {
    dashboard: ['dashboard', 'overview', 'hierarchy', 'stats'],
    companies: ['company', 'companies', 'firm', 'organization'],
    employees: ['employee', 'staff', 'user', 'personnel'],
    roles: ['role', 'permission', 'access', 'function', 'privilege'],
    reports: ['report', 'admin report'],
    engagement: ['engagement', 'review', 'ad', 'advertisement', 'feedback', 'rating'],
    subscriptions: ['subscription', 'plan', 'pricing', 'billing', 'renewal', 'expiry'],
    database: ['database', 'backup', 'restore', 'maintenance', 'db'],
    security: ['security', 'audit', 'log', 'scan', 'threat', 'event'],
    integrations: ['integration', 'api', 'email', 'sms', 'payment', 'gateway', 'swagger'],
    feedback: ['feedback', 'complaint', 'suggestion'],
    passwordResets: ['reset', 'password', 'token'],
    employeeMessaging: ['sms', 'message', 'text', 'employee message'],
    config: ['config', 'setting', 'configuration', 'lock', 'module'],
    logs: ['log', 'audit trail', 'system log'],
    aiChatbot: ['ai', 'chatbot', 'assistant', 'intelligence']
  };

  const matched = [];
  for (const [moduleKey, moduleKeywords] of Object.entries(keywords)) {
    if (moduleKeywords.some(kw => lower.includes(kw))) {
      matched.push(saModules[moduleKey]);
    }
  }
  return matched;
};
