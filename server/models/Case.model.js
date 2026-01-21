const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  // ===== MULTI-TENANT & REFERENCES =====
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  consultancyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultancy',
    required: true
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },

  // ===== CASE IDENTIFICATION =====
  caseNumber: {
    type: String,
    unique: true,
    sparse: true
    // Auto-generated: CASE2026000001
  },

  caseTitle: {
    type: String,
    required: true
  },

  description: String,

  // ===== CASE WORKFLOW STAGES (JIRA-LIKE) =====
  stage: {
    type: String,
    enum: [
      'Initial Consultation',      // Stage 0: First meeting
      'Assessment & Planning',     // Stage 1: Evaluate eligibility
      'Documentation',             // Stage 2: Collect all documents
      'Application Preparation',   // Stage 3: Prepare visa application
      'Ready for Submission',      // Stage 4: All ready
      'Application Lodged',        // Stage 5: Submitted to DIBP
      'Visa Processing',           // Stage 6: Under review
      'Pending Decision',          // Stage 7: Waiting for decision
      'Finalisation',              // Stage 8: Visa granted/refused
      'Post-visa Support'          // Stage 9: After approval
    ],
    default: 'Initial Consultation',
    index: true
  },

  stageHistory: [{
    stage: String,
    enteredDate: { type: Date, default: Date.now },
    exitedDate: Date,
    daysInStage: Number,
    movedBy: mongoose.Schema.Types.ObjectId,
    notes: String
  }],

  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Completed'],
    default: 'Not Started',
    index: true
  },

  // ===== PRIORITY & TIMING =====
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  startDate: Date,
  targetCompletionDate: Date,
  actualCompletionDate: Date,
  estimatedDaysToCompletion: Number,

  // ===== TASKS/SUBTASKS (LIKE JIRA) =====
  tasks: [{
    _id: mongoose.Schema.Types.ObjectId,
    
    // Task Identification
    taskNumber: String,  // CASE-0001-TASK-001
    title: {
      type: String,
      required: true
    },
    description: String,
    
    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    
    // Status & Progress
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'In Review', 'Blocked', 'Done'],
      default: 'To Do'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    
    // Dates
    dueDate: Date,
    startDate: Date,
    completedDate: Date,
    
    // Progress Tracking
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    blockers: [String],
    
    // Subtasks/Checklist
    subtasks: [{
      item: String,
      checked: Boolean,
      checkedDate: Date,
      checkedBy: mongoose.Schema.Types.ObjectId
    }],
    
    // Attachments & Links
    attachments: [{
      fileName: String,
      fileUrl: String,
      uploadedDate: Date,
      uploadedBy: mongoose.Schema.Types.ObjectId
    }],
    relatedDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    
    // Comments
    comments: [{
      author: mongoose.Schema.Types.ObjectId,
      authorName: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
      attachments: [String]
    }],
    
    // Metadata
    estimatedHours: Number,
    actualHours: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  // ===== TEAM ASSIGNMENTS =====
  primaryAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },

  secondaryAssignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }],

  teamMembers: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    role: {
      type: String,
      enum: ['Primary Agent', 'Case Manager', 'Document Specialist', 'Reviewer', 'Observer']
    },
    joinedDate: Date,
    hoursAllocated: Number
  }],

  // ===== APPLICATIONS LINKED =====
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],

  // ===== DOCUMENTS =====
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],

  // ===== COMMUNICATIONS & NOTES =====
  notes: [{
    date: { type: Date, default: Date.now },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    authorName: String,
    content: String,
    attachments: [String],
    type: {
      type: String,
      enum: ['Internal Note', 'Client Communication', 'DIBP Communication', 'Team Update']
    },
    isPrivate: { type: Boolean, default: true },
    mentions: [String]  // @mention team members
  }],

  // ===== TIMELINE/ACTIVITY LOG =====
  timeline: [{
    date: { type: Date, default: Date.now },
    event: String,  // "Task Created", "Stage Changed", "Document Uploaded"
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    performedByName: String,
    details: mongoose.Schema.Types.Mixed,
    taskId: mongoose.Schema.Types.ObjectId
  }],

  // ===== RISK & BLOCKERS =====
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    riskFactors: [String],
    mitigationStrategy: String,
    assessmentDate: Date,
    assessedBy: mongoose.Schema.Types.ObjectId
  },

  blockers: [{
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    createdDate: Date,
    resolvedDate: Date,
    resolution: String,
    createdBy: mongoose.Schema.Types.ObjectId
  }],

  // ===== DEADLINES =====
  deadlines: [{
    title: String,
    description: String,
    dueDate: Date,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    status: {
      type: String,
      enum: ['Pending', 'On Track', 'At Risk', 'Overdue']
    },
    completedDate: Date,
    notes: String
  }],

  // ===== PROGRESS & METRICS =====
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  metrics: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    tasksInProgress: { type: Number, default: 0 },
    tasksBlocked: { type: Number, default: 0 },
    
    documentsRequired: Number,
    documentsCollected: Number,
    documentsPending: Number,
    
    totalHoursLogged: Number,
    estimatedHoursRemaining: Number
  },

  // ===== CUSTOM FIELDS & TAGS =====
  tags: [String],
  
  customFields: {
    type: mongoose.Schema.Types.Mixed
  },

  // ===== NOTIFICATIONS & ALERTS =====
  alerts: [{
    type: {
      type: String,
      enum: ['Deadline', 'Blocker', 'Document Missing', 'Information Required']
    },
    message: String,
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical']
    },
    createdDate: Date,
    resolvedDate: Date,
    recipients: [mongoose.Schema.Types.ObjectId]
  }],

  // ===== FINANCIAL TRACKING =====
  financials: {
    estimatedServiceCost: Number,
    actualServiceCost: Number,
    hoursWorked: Number,
    hourlyRate: Number,
    
    expenses: [{
      description: String,
      amount: Number,
      date: Date,
      category: String,
      receipt: String
    }]
  },

  // ===== METADATA =====
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }

}, { timestamps: true });

// ===== AUTO-GENERATE CASE NUMBER =====
caseSchema.pre('save', async function(next) {
  if (!this.caseNumber) {
    const count = await mongoose.model('Case').countDocuments();
    const year = new Date().getFullYear();
    this.caseNumber = `CASE${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// ===== AUTO-GENERATE TASK NUMBERS =====
caseSchema.methods.addTask = function(taskData) {
  const taskNumber = `${this.caseNumber}-T${String(this.tasks.length + 1).padStart(3, '0')}`;
  const task = {
    _id: new mongoose.Types.ObjectId(),
    taskNumber,
    ...taskData,
    createdAt: new Date()
  };
  this.tasks.push(task);
  return task;
};

// ===== CALCULATE PROGRESS PERCENTAGE =====
caseSchema.methods.updateProgressPercentage = function() {
  if (this.tasks.length === 0) {
    this.progressPercentage = 0;
    return;
  }
  
  const completedTasks = this.tasks.filter(t => t.status === 'Done').length;
  this.progressPercentage = Math.round((completedTasks / this.tasks.length) * 100);
};

// ===== MOVE TO NEXT STAGE =====
caseSchema.methods.moveToNextStage = async function(movedBy, notes) {
  const stages = [
    'Initial Consultation',
    'Assessment & Planning',
    'Documentation',
    'Application Preparation',
    'Ready for Submission',
    'Application Lodged',
    'Visa Processing',
    'Pending Decision',
    'Finalisation',
    'Post-visa Support'
  ];
  
  const currentIndex = stages.indexOf(this.stage);
  if (currentIndex < stages.length - 1) {
    const oldStage = this.stage;
    this.stage = stages[currentIndex + 1];
    
    // Record stage change
    this.stageHistory.push({
      stage: oldStage,
      enteredDate: this.stageHistory[this.stageHistory.length - 1]?.enteredDate || this.createdAt,
      exitedDate: new Date(),
      movedBy,
      notes
    });
    
    // Add timeline entry
    this.timeline.push({
      date: new Date(),
      event: 'Stage Changed',
      action: `Moved from ${oldStage} to ${this.stage}`,
      performedBy: movedBy,
      details: { from: oldStage, to: this.stage }
    });
    
    await this.save();
  }
};

// ===== INDEXES =====
caseSchema.index({ tenantId: 1, consultancyId: 1 });
caseSchema.index({ caseNumber: 1 }, { unique: true });
caseSchema.index({ clientId: 1 });
caseSchema.index({ agentId: 1, stage: 1 });
caseSchema.index({ stage: 1, status: 1 });
caseSchema.index({ primaryAssignee: 1 });
caseSchema.index({ createdAt: -1 });
caseSchema.index({ progressPercentage: 1 });

module.exports = mongoose.model('Case', caseSchema);
