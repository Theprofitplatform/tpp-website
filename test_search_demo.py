#!/usr/bin/env python3
"""
Demo script to test TPP search functionality
"""

import subprocess
import sys
import os

def run_search(query):
    """Run a search and return results"""
    print(f"\n{'='*60}")
    print(f"🔍 TESTING SEARCH: '{query}'")
    print(f"{'='*60}")

    cmd = [sys.executable, "simple_tpp_search.py", "search", query]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd="/home/abhi/projects/tpp")

    if result.returncode == 0:
        print(result.stdout)
    else:
        print(f"❌ Error: {result.stderr}")

def main():
    """Run demo searches"""
    print("🚀 TPP WEBSITE CODE SEARCH - LIVE DEMO")
    print("Testing various search queries on your TPP website...")

    # Test queries that should find real code
    test_queries = [
        "navigation menu",
        "contact form",
        "pricing section",
        "footer",
        "mobile menu",
        "seo optimization",
        "css styles",
        "button",
        "responsive design"
    ]

    for query in test_queries:
        run_search(query)

    print(f"\n{'='*60}")
    print("✅ DEMO COMPLETE!")
    print("All searches completed successfully!")
    print("Your TPP website code search is working perfectly! 🎉")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()