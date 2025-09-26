#!/bin/bash

# The Profit Platform - Page Fixes Coordination Script
SESSION_NAME="page-fixes"

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Create new session
tmux new-session -d -s $SESSION_NAME -n "coordinator"

# Window 1: CSS Assets Fix
tmux new-window -t $SESSION_NAME -n "css-assets"
tmux send-keys -t $SESSION_NAME:css-assets "cd /home/abhi/projects/tpp/website" Enter
tmux send-keys -t $SESSION_NAME:css-assets "echo '=== FIXING CSS ASSETS ===' && echo 'Creating missing CSS files...'" Enter

# Window 2: Image Assets Fix
tmux new-window -t $SESSION_NAME -n "images"
tmux send-keys -t $SESSION_NAME:images "cd /home/abhi/projects/tpp/website" Enter
tmux send-keys -t $SESSION_NAME:images "echo '=== FIXING IMAGE ASSETS ===' && echo 'Checking image files...'" Enter

# Window 3: Contact Forms Integration
tmux new-window -t $SESSION_NAME -n "forms"
tmux send-keys -t $SESSION_NAME:forms "cd /home/abhi/projects/tpp/website" Enter
tmux send-keys -t $SESSION_NAME:forms "echo '=== FIXING CONTACT FORMS ===' && echo 'Integrating with backend...'" Enter

# Window 4: Page Testing
tmux new-window -t $SESSION_NAME -n "testing"
tmux send-keys -t $SESSION_NAME:testing "cd /home/abhi/projects/tpp" Enter
tmux send-keys -t $SESSION_NAME:testing "echo '=== TESTING PAGES ===' && echo 'Running validation tests...'" Enter

# Window 5: Backend Status
tmux new-window -t $SESSION_NAME -n "backend"
tmux send-keys -t $SESSION_NAME:backend "cd /home/abhi/projects/worktrees/tpp/feature-backend" Enter
tmux send-keys -t $SESSION_NAME:backend "echo '=== BACKEND STATUS ===' && npm run status || echo 'Backend not running'" Enter

# Create status dashboard in main window
tmux select-window -t $SESSION_NAME:coordinator
tmux send-keys -t $SESSION_NAME:coordinator "clear" Enter
tmux send-keys -t $SESSION_NAME:coordinator "cat << 'EOF'
🚀 THE PROFIT PLATFORM - PAGE FIXES COORDINATION CENTER
========================================================

📋 MASTER PLAN EXECUTION STATUS:
✅ Phase 1: Create missing FAQ page - COMPLETED
🔧 Phase 2: Fix broken assets - IN PROGRESS
📧 Phase 3: Contact form integration - PENDING
✅ Phase 4: Content validation - PENDING

🎛️  TMUX HOTKEYS:
Ctrl-b + 1  →  CSS Assets Fix
Ctrl-b + 2  →  Image Assets
Ctrl-b + 3  →  Contact Forms
Ctrl-b + 4  →  Page Testing
Ctrl-b + 5  →  Backend Status
Ctrl-b + 0  →  Return to Coordinator

🚨 CRITICAL ISSUES TO FIX:
- Missing CSS files (critical.css, style.min.css, universal-nav.css)
- Broken image references (logo.png, logo.webp)
- Contact forms not connected to backend
- Inconsistent page styling

Press any key to start parallel execution...
EOF" Enter

# Set up key bindings for quick navigation
tmux bind-key -n F1 select-window -t $SESSION_NAME:coordinator
tmux bind-key -n F2 select-window -t $SESSION_NAME:css-assets
tmux bind-key -n F3 select-window -t $SESSION_NAME:images
tmux bind-key -n F4 select-window -t $SESSION_NAME:forms
tmux bind-key -n F5 select-window -t $SESSION_NAME:testing
tmux bind-key -n F6 select-window -t $SESSION_NAME:backend

# Set status line with progress indicators
tmux set-option -t $SESSION_NAME status-left "#[fg=green,bold]TPP-FIXES#[default] "
tmux set-option -t $SESSION_NAME status-right "#[fg=blue]%H:%M #[fg=green]%d-%b#[default]"

echo "🚀 Tmux session '$SESSION_NAME' created successfully!"
echo ""
echo "📋 Access the coordination center:"
echo "   tmux attach-session -t $SESSION_NAME"
echo ""
echo "🎛️  Quick window navigation:"
echo "   F1: Coordinator | F2: CSS | F3: Images | F4: Forms | F5: Testing | F6: Backend"
echo ""
echo "🔥 Ready to fix all menu bar pages in parallel!"