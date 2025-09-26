#!/bin/bash

# Quick GPU Navigation Script for The Profit Platform
SESSION_NAME="tpp-gpu-dev"

echo "🔥 GPU-ACCELERATED NAVIGATION"
echo "============================="
echo ""
echo "Choose your GPU-accelerated workspace:"
echo ""
echo "1) 🎛️  GPU Coordinator Dashboard"
echo "2) 🖼️  GPU Image Processing"
echo "3) 🧪 GPU Testing Pipeline"
echo "4) 📦 GPU Asset Optimization"
echo "5) ⚙️  GPU Build System"
echo "6) 📊 GPU Performance Monitor"
echo "7) 🔥 GPU Backend Processing"
echo ""
echo "q) Quit"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo "🎛️  Switching to GPU Coordinator..."
        tmux select-window -t $SESSION_NAME:gpu-coordinator
        ;;
    2)
        echo "🖼️  Switching to GPU Image Processing..."
        tmux select-window -t $SESSION_NAME:gpu-images
        ;;
    3)
        echo "🧪 Switching to GPU Testing Pipeline..."
        tmux select-window -t $SESSION_NAME:gpu-testing
        ;;
    4)
        echo "📦 Switching to GPU Asset Optimization..."
        tmux select-window -t $SESSION_NAME:gpu-assets
        ;;
    5)
        echo "⚙️  Switching to GPU Build System..."
        tmux select-window -t $SESSION_NAME:gpu-build
        ;;
    6)
        echo "📊 Switching to GPU Performance Monitor..."
        tmux select-window -t $SESSION_NAME:gpu-monitor
        ;;
    7)
        echo "🔥 Switching to GPU Backend Processing..."
        tmux select-window -t $SESSION_NAME:gpu-backend
        ;;
    q|Q)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please enter 1-7 or q"
        ;;
esac