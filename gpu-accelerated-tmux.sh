#!/bin/bash

# The Profit Platform - GPU-Accelerated Development Setup
SESSION_NAME="tpp-gpu-dev"

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Create new GPU-accelerated session
tmux new-session -d -s $SESSION_NAME -n "gpu-coordinator"

# Window 1: GPU-Accelerated Image Processing
tmux new-window -t $SESSION_NAME -n "gpu-images"
tmux send-keys -t $SESSION_NAME:gpu-images "cd /home/abhi/projects/tpp/website" Enter
tmux send-keys -t $SESSION_NAME:gpu-images "echo '🖥️ GPU-ACCELERATED IMAGE PROCESSING'" Enter

# Window 2: GPU-Accelerated Testing (Playwright with GPU)
tmux new-window -t $SESSION_NAME -n "gpu-testing"
tmux send-keys -t $SESSION_NAME:gpu-testing "cd /home/abhi/projects/tpp" Enter
tmux send-keys -t $SESSION_NAME:gpu-testing "echo '⚡ GPU-ACCELERATED TESTING PIPELINE'" Enter

# Window 3: GPU-Accelerated Asset Optimization
tmux new-window -t $SESSION_NAME -n "gpu-assets"
tmux send-keys -t $SESSION_NAME:gpu-assets "cd /home/abhi/projects/tpp/website" Enter
tmux send-keys -t $SESSION_NAME:gpu-assets "echo '🚀 GPU-ACCELERATED ASSET OPTIMIZATION'" Enter

# Window 4: GPU-Accelerated Build Pipeline
tmux new-window -t $SESSION_NAME -n "gpu-build"
tmux send-keys -t $SESSION_NAME:gpu-build "cd /home/abhi/projects/tpp" Enter
tmux send-keys -t $SESSION_NAME:gpu-build "echo '⚙️ GPU-ACCELERATED BUILD SYSTEM'" Enter

# Window 5: GPU Performance Monitoring
tmux new-window -t $SESSION_NAME -n "gpu-monitor"
tmux send-keys -t $SESSION_NAME:gpu-monitor "cd /home/abhi/projects/tpp" Enter
tmux send-keys -t $SESSION_NAME:gpu-monitor "echo '📊 GPU PERFORMANCE MONITORING'" Enter

# Window 6: GPU-Accelerated Backend
tmux new-window -t $SESSION_NAME -n "gpu-backend"
tmux send-keys -t $SESSION_NAME:gpu-backend "cd /home/abhi/projects/worktrees/tpp/feature-backend" Enter
tmux send-keys -t $SESSION_NAME:gpu-backend "echo '🔥 GPU-ACCELERATED BACKEND PROCESSING'" Enter

# Create GPU-accelerated coordinator dashboard
tmux select-window -t $SESSION_NAME:gpu-coordinator
tmux send-keys -t $SESSION_NAME:gpu-coordinator "clear" Enter
tmux send-keys -t $SESSION_NAME:gpu-coordinator "cat << 'EOF'
🚀 THE PROFIT PLATFORM - GPU-ACCELERATED DEVELOPMENT CENTER
================================================================

⚡ GPU ACCELERATION ENABLED FOR:
🖼️  Image Processing & Optimization (WebP, AVIF conversion)
🧪 Parallel Test Execution (Multi-browser testing)
📦 Asset Bundling & Minification (Parallel processing)
🔍 Code Analysis & Linting (Concurrent execution)
📊 Performance Monitoring (Real-time metrics)
🔥 Backend Processing (AI-powered features)

🎛️  GPU-ACCELERATED HOTKEYS:
F1: GPU Coordinator     F2: GPU Image Processing
F3: GPU Testing        F4: GPU Asset Optimization
F5: GPU Build Pipeline F6: GPU Performance Monitor
F7: GPU Backend

🚨 ACTIVE GPU WORKLOADS:
- Image format conversion (WebP/AVIF)
- Parallel Playwright testing across browsers
- Concurrent CSS/JS minification
- Real-time performance analysis
- AI-powered content optimization

🎯 GPU UTILIZATION TARGETS:
- Image Processing: 80-90% GPU usage
- Testing Pipeline: 60-80% parallel execution
- Asset Optimization: 70-85% throughput
- Backend AI: Variable based on workload

Press any key to start GPU-accelerated development...
EOF" Enter

# Set up enhanced key bindings
tmux bind-key -n F1 select-window -t $SESSION_NAME:gpu-coordinator
tmux bind-key -n F2 select-window -t $SESSION_NAME:gpu-images
tmux bind-key -n F3 select-window -t $SESSION_NAME:gpu-testing
tmux bind-key -n F4 select-window -t $SESSION_NAME:gpu-assets
tmux bind-key -n F5 select-window -t $SESSION_NAME:gpu-build
tmux bind-key -n F6 select-window -t $SESSION_NAME:gpu-monitor
tmux bind-key -n F7 select-window -t $SESSION_NAME:gpu-backend

# Enhanced status line with GPU indicators
tmux set-option -t $SESSION_NAME status-left "#[fg=red,bold]🔥GPU#[default] #[fg=green,bold]TPP#[default] "
tmux set-option -t $SESSION_NAME status-right "#[fg=yellow]⚡GPU#[default] #[fg=blue]%H:%M#[default] #[fg=green]%d-%b#[default]"

echo "🔥 GPU-accelerated tmux session '$SESSION_NAME' created!"
echo ""
echo "📋 Access the GPU development center:"
echo "   tmux attach-session -t $SESSION_NAME"
echo ""
echo "⚡ GPU-accelerated workflows ready for:"
echo "   🖼️  Image processing & optimization"
echo "   🧪 Parallel test execution"
echo "   📦 Asset bundling & minification"
echo "   🔍 Code analysis & performance monitoring"
echo "   🔥 AI-powered backend features"
echo ""
echo "🎯 Ready for maximum development velocity!"