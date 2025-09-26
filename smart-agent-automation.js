// Smart Agent Auto-Spawning System
// Automatically spawns specialized agents based on context

const fileTypeAgentMap = {
  // Language-specific agents
  '.js': 'coder',
  '.jsx': 'coder',
  '.ts': 'coder',
  '.tsx': 'coder',
  '.py': 'coder',
  '.java': 'coder',
  '.cpp': 'coder',
  '.c': 'coder',
  '.rs': 'coder',
  '.go': 'coder',
  
  // Documentation agents
  '.md': 'documenter',
  '.rst': 'documenter',
  '.txt': 'documenter',
  
  // Configuration agents
  '.json': 'analyst',
  '.yaml': 'analyst',
  '.yml': 'analyst',
  '.toml': 'analyst',
  '.env': 'analyst',
  
  // Test agents
  '.test.js': 'tester',
  '.spec.js': 'tester',
  '.test.ts': 'tester',
  '.spec.ts': 'tester',
  
  // Performance agents
  '.perf.js': 'performance-benchmarker',
  '.bench.js': 'performance-benchmarker',
  
  // Architecture agents
  '.drawio': 'system-architect',
  '.puml': 'system-architect',
  '.diagram': 'system-architect'
};

const taskComplexityPatterns = {
  simple: [
    /fix\s+typo/i,
    /update\s+comment/i,
    /rename\s+variable/i,
    /add\s+log/i
  ],
  medium: [
    /add\s+feature/i,
    /implement\s+function/i,
    /create\s+component/i,
    /refactor/i
  ],
  complex: [
    /implement.*auth/i,
    /integrate.*api/i,
    /migrate.*database/i,
    /redesign.*architecture/i,
    /optimize.*performance/i
  ]
};

class SmartAgentAutomation {
  constructor() {
    this.swarmId = null;
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.performanceMetrics = new Map();
  }
  
  async initialize() {
    try {
      // Initialize swarm with adaptive topology
      const swarm = await this.initializeSwarm();
      this.swarmId = swarm.swarmId;
      console.log(`✅ Smart Agent Swarm initialized: ${this.swarmId}`);
      
      // Start monitoring
      this.startMonitoring();
      
      return swarm;
    } catch (error) {
      console.error('Failed to initialize smart agents:', error);
      throw error;
    }
  }
  
  async initializeSwarm() {
    // This would integrate with mcp__claude-flow__swarm_init
    return {
      swarmId: 'swarm_' + Date.now(),
      topology: 'mesh',
      maxAgents: 8,
      strategy: 'auto'
    };
  }
  
  async detectFileType(filePath) {
    const extension = filePath.match(/\.[^.]+$/);
    if (!extension) return null;
    
    // Check for test files first
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      return 'tester';
    }
    
    // Check for performance files
    if (filePath.includes('.perf.') || filePath.includes('.bench.')) {
      return 'performance-benchmarker';
    }
    
    return fileTypeAgentMap[extension[0]] || 'coordinator';
  }
  
  analyzeTaskComplexity(taskDescription) {
    for (const [level, patterns] of Object.entries(taskComplexityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(taskDescription)) {
          return level;
        }
      }
    }
    return 'medium'; // Default complexity
  }
  
  async spawnAgentsForTask(taskDescription, files = []) {
    const complexity = this.analyzeTaskComplexity(taskDescription);
    const agentsNeeded = new Set();
    
    // Analyze files to determine needed agents
    for (const file of files) {
      const agentType = await this.detectFileType(file);
      if (agentType) {
        agentsNeeded.add(agentType);
      }
    }
    
    // Add agents based on complexity
    switch (complexity) {
      case 'simple':
        agentsNeeded.add('coordinator');
        break;
      case 'medium':
        agentsNeeded.add('coordinator');
        agentsNeeded.add('analyst');
        break;
      case 'complex':
        agentsNeeded.add('coordinator');
        agentsNeeded.add('system-architect');
        agentsNeeded.add('analyst');
        agentsNeeded.add('optimizer');
        if (taskDescription.match(/test|testing/i)) {
          agentsNeeded.add('tester');
        }
        break;
    }
    
    // Spawn required agents
    const spawnedAgents = [];
    for (const agentType of agentsNeeded) {
      if (!this.activeAgents.has(agentType)) {
        const agent = await this.spawnAgent(agentType);
        spawnedAgents.push(agent);
      }
    }
    
    return {
      complexity,
      agentsSpawned: spawnedAgents,
      totalAgents: this.activeAgents.size
    };
  }
  
  async spawnAgent(type) {
    const capabilities = this.getAgentCapabilities(type);
    
    // This would integrate with mcp__claude-flow__agent_spawn
    const agent = {
      id: `agent_${type}_${Date.now()}`,
      type,
      capabilities,
      status: 'active',
      spawnTime: new Date().toISOString()
    };
    
    this.activeAgents.set(type, agent);
    console.log(`🤖 Spawned ${type} agent: ${agent.id}`);
    
    return agent;
  }
  
  getAgentCapabilities(type) {
    const capabilityMap = {
      'coder': ['javascript', 'typescript', 'python', 'java', 'code-generation'],
      'tester': ['unit-testing', 'integration-testing', 'test-generation'],
      'analyst': ['data-analysis', 'configuration', 'optimization'],
      'coordinator': ['task-management', 'delegation', 'monitoring'],
      'documenter': ['documentation', 'markdown', 'api-docs'],
      'system-architect': ['architecture-design', 'system-planning', 'diagramming'],
      'performance-benchmarker': ['performance-testing', 'profiling', 'optimization'],
      'optimizer': ['code-optimization', 'refactoring', 'performance']
    };
    
    return capabilityMap[type] || ['general'];
  }
  
  async dynamicScaling() {
    // Monitor task queue and agent performance
    const queueLength = this.taskQueue.length;
    const activeAgentCount = this.activeAgents.size;
    const avgPerformance = this.calculateAveragePerformance();
    
    // Scale up if needed
    if (queueLength > activeAgentCount * 2 && activeAgentCount < 8) {
      // Spawn additional workers
      await this.spawnAgent('coordinator');
      console.log('📈 Scaled up: Added coordinator agent');
    }
    
    // Scale down if over-provisioned
    if (queueLength === 0 && activeAgentCount > 2) {
      // Remove idle agents
      this.removeIdleAgents();
      console.log('📉 Scaled down: Removed idle agents');
    }
  }
  
  calculateAveragePerformance() {
    if (this.performanceMetrics.size === 0) return 1;
    
    let total = 0;
    for (const [agentId, metrics] of this.performanceMetrics) {
      total += metrics.efficiency || 1;
    }
    
    return total / this.performanceMetrics.size;
  }
  
  removeIdleAgents() {
    const idleThreshold = Date.now() - 5 * 60 * 1000; // 5 minutes
    
    for (const [type, agent] of this.activeAgents) {
      if (agent.lastActive && agent.lastActive < idleThreshold) {
        this.activeAgents.delete(type);
        console.log(`🗑️ Removed idle agent: ${agent.id}`);
      }
    }
  }
  
  startMonitoring() {
    // Monitor swarm health every 30 seconds
    setInterval(() => {
      this.dynamicScaling();
      this.checkSwarmHealth();
    }, 30000);
  }
  
  async checkSwarmHealth() {
    try {
      // This would integrate with mcp__claude-flow__swarm_status
      const health = {
        swarmId: this.swarmId,
        activeAgents: this.activeAgents.size,
        taskQueueLength: this.taskQueue.length,
        averagePerformance: this.calculateAveragePerformance()
      };
      
      if (health.averagePerformance < 0.5) {
        console.warn('⚠️ Swarm performance degraded');
        await this.optimizeSwarm();
      }
      
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }
  
  async optimizeSwarm() {
    // Redistribute tasks among agents
    console.log('🔧 Optimizing swarm configuration...');
    
    // Analyze agent workloads
    const workloads = new Map();
    for (const [type, agent] of this.activeAgents) {
      const metrics = this.performanceMetrics.get(agent.id) || {};
      workloads.set(type, metrics.taskCount || 0);
    }
    
    // Rebalance if needed
    const avgWorkload = Array.from(workloads.values()).reduce((a, b) => a + b, 0) / workloads.size;
    
    for (const [type, workload] of workloads) {
      if (workload > avgWorkload * 1.5) {
        // Spawn helper agent
        await this.spawnAgent(type);
        console.log(`⚖️ Rebalanced: Added ${type} agent for load distribution`);
      }
    }
  }
  
  // Task orchestration
  async orchestrateTask(description, options = {}) {
    const { files = [], priority = 'medium' } = options;
    
    // Auto-spawn agents based on task
    const spawnResult = await this.spawnAgentsForTask(description, files);
    
    // This would integrate with mcp__claude-flow__task_orchestrate
    const task = {
      id: `task_${Date.now()}`,
      description,
      complexity: spawnResult.complexity,
      priority,
      assignedAgents: Array.from(this.activeAgents.keys()),
      status: 'orchestrated',
      timestamp: new Date().toISOString()
    };
    
    this.taskQueue.push(task);
    
    console.log(`📋 Task orchestrated: ${task.id}`);
    console.log(`   Complexity: ${spawnResult.complexity}`);
    console.log(`   Agents: ${spawnResult.agentsSpawned.map(a => a.type).join(', ')}`);
    
    return task;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartAgentAutomation;
}

// Auto-initialize if run directly
if (require.main === module) {
  const automation = new SmartAgentAutomation();
  automation.initialize().then(() => {
    console.log('🚀 Smart Agent Automation System Ready');
    
    // Example usage
    automation.orchestrateTask(
      'Implement OAuth authentication with Google',
      { files: ['auth.js', 'config.json'] }
    );
  });
}