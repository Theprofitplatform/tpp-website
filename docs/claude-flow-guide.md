# Claude Flow Usage Guide

## 🎯 The Golden Pattern: MCP Coordinates, Task Tool Executes

### Most Effective Workflow

```javascript
// Single message with EVERYTHING parallel:
[Coordination Setup]:
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 5 }

[Agent Execution via Task Tool]:
  Task("Research requirements and patterns", "analyzer-researcher")
  Task("Design system architecture", "system-architect")
  Task("Implement core features", "coder")
  Task("Create comprehensive tests", "tester")
  Task("Review code quality", "reviewer")

[Task Management]:
  TodoWrite { todos: [8-10 todos batched together] }

[File Operations]:
  Bash "mkdir -p src/{components,utils,tests}"
  Write "src/package.json"
  Write "src/app.js"
```

## 🚀 Quick Start Commands

### Essential Commands
```bash
# Basic swarm creation
npx claude-flow@alpha swarm "build REST API" --claude

# Hive mind coordination
npx claude-flow@alpha hive-mind spawn "create feature" --claude

# SPARC methodology
npx claude-flow@alpha sparc tdd "user authentication"

# System status
npx claude-flow@alpha status
```

### SPARC Development
```bash
# Complete TDD workflow
npx claude-flow@alpha sparc tdd "user authentication system"

# Individual phases
npx claude-flow@alpha sparc run spec-pseudocode "login feature"
npx claude-flow@alpha sparc run architect "API design"
npx claude-flow@alpha sparc modes  # List all available modes
```

## 🤖 Available Agents (64 Total)

### Core Development
- `coder` - Implementation
- `reviewer` - Code quality
- `tester` - Test creation
- `system-architect` - High-level design
- `researcher` - Requirements analysis

### Performance & Analysis
- `perf-analyzer` - Bottleneck identification
- `code-analyzer` - Code analysis
- `ml-developer` - AI/ML features
- `performance-benchmarker` - Performance testing

### GitHub Integration
- `github-modes` - Repository management
- `pr-manager` - Pull request automation
- `code-review-swarm` - Multi-agent reviews
- `issue-tracker` - Issue management
- `release-manager` - Release coordination

### Specialized Development
- `backend-dev` - API development
- `mobile-dev` - React Native
- `cicd-engineer` - CI/CD pipelines
- `api-docs` - Documentation
- `sparc-coder` - TDD implementation

### Swarm Coordination
- `hierarchical-coordinator` - Queen-led coordination
- `mesh-coordinator` - Peer-to-peer
- `adaptive-coordinator` - Dynamic topology
- `collective-intelligence-coordinator` - Hive-mind
- `swarm-memory-manager` - Distributed memory

## 💡 Best Practices

### 1. Always Batch Operations
```javascript
// ✅ Do this - everything in one message
Task("Backend", "...", "backend-dev")
Task("Frontend", "...", "coder")
Task("Tests", "...", "tester")
TodoWrite { todos: [...] }
Write "file1.js"
Write "file2.js"

// ❌ Never do this - multiple messages
Message 1: Task("Backend")
Message 2: Task("Frontend")
Message 3: TodoWrite
```

### 2. Use Proper File Organization
Never save to root - use subdirectories:
```bash
/src          # Source code
/tests        # Test files
/docs         # Documentation
/config       # Configuration
/scripts      # Utility scripts
/examples     # Example code
```

### 3. Leverage Memory for Coordination
Agents automatically store decisions in `.swarm/memory.db`:
- API contracts
- Architecture decisions
- Code patterns
- Test strategies

### 4. Use Hooks for Automation
Already configured in `.claude/settings.json`:
- Auto-formatting after edits
- Git checkpoints
- Performance tracking
- Cross-agent coordination

## 🎯 Effective Workflows

### For New Features
```bash
# Quick swarm spawn with Claude Code integration
npx claude-flow@alpha hive-mind spawn "build payment system" --claude
```

### For Code Reviews
```bash
# Multi-agent code review
npx claude-flow@alpha swarm "review codebase for security" --claude
```

### For Testing
```bash
# TDD workflow with coordinated agents
npx claude-flow@alpha sparc tdd "shopping cart feature"
```

### For Architecture Design
```bash
# System architecture with specialized agents
npx claude-flow@alpha swarm "design microservices architecture" --claude
```

## 📊 System Monitoring

### Check Status
```bash
# Overall system status
npx claude-flow@alpha status

# Hive mind status
npx claude-flow@alpha hive-mind status

# Memory usage
npx claude-flow@alpha memory list

# Performance metrics
npx claude-flow@alpha analysis token-usage --breakdown
```

### Available MCP Tools
- **Coordination**: `swarm_init`, `agent_spawn`, `task_orchestrate`
- **Monitoring**: `swarm_status`, `agent_metrics`, `task_results`
- **Memory**: `memory_usage`, `neural_patterns`
- **GitHub**: `github_swarm`, `repo_analyze`, `pr_enhance`

## ⚡ Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**
- **Cross-session memory persistence**

## 🔧 Advanced Features

### Hooks Integration
- **Pre-Operation**: Auto-assign agents, validate commands, prepare resources
- **Post-Operation**: Auto-format code, train patterns, update memory
- **Session Management**: Generate summaries, persist state, track metrics

### Neural Pattern Learning
- Automatic pattern recognition from successful workflows
- Cross-session learning and optimization
- Performance bottleneck analysis

### GitHub Integration
- Automated PR reviews with multi-agent coordination
- Issue triage and management
- Release coordination and deployment

## 💡 Pro Tips

1. **Start Complex**: Use `hive-mind spawn` for multi-step tasks
2. **Stay Parallel**: Always batch related operations in single messages
3. **Use Specialists**: Match agents to specific task types
4. **Monitor Progress**: Regularly check system status
5. **Trust Memory**: Agents share context automatically via SQLite
6. **Leverage SPARC**: For systematic, test-driven development

## 🎯 Quick Reference

```bash
# Most effective commands for daily use
npx claude-flow@alpha hive-mind spawn "task" --claude
npx claude-flow@alpha sparc tdd "feature"
npx claude-flow@alpha swarm "objective" --claude
npx claude-flow@alpha status
npx claude-flow@alpha memory store key value
npx claude-flow@alpha analysis token-usage
```

## 📚 Resources

- **Documentation**: https://github.com/ruvnet/claude-flow
- **Issues**: https://github.com/ruvnet/claude-flow/issues
- **Flow-Nexus Platform**: https://flow-nexus.ruv.io
- **Local Command Docs**: `.claude/commands/` directory

---

**Remember**: Claude Flow coordinates the strategy while Claude Code's Task tool executes with real agents running in parallel for maximum effectiveness.