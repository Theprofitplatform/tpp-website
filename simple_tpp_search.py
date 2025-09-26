#!/usr/bin/env python3
"""
Simple TPP Code Search (No Dependencies)
Basic keyword-based search for the TPP website project

Usage: python3 simple_tpp_search.py
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class SearchResult:
    name: str
    file_path: str
    line_number: int
    content: str
    file_type: str
    score: float

class SimpleTTPSearch:
    def __init__(self):
        print("🚀 Simple TPP Code Search")
        self.code_chunks = []
        self.project_root = Path(__file__).parent
        print("✅ Ready!")

    def index_project(self):
        """Index the TPP project with simple extraction"""
        print(f"📂 Indexing TPP project at: {self.project_root}")

        skip_dirs = {'.git', '__pycache__', 'node_modules', '.venv', 'test-results',
                    'playwright-report', '.claude-flow', '.hive-mind', '.swarm'}

        # Index HTML files
        html_files = list(self.project_root.rglob("*.html"))
        for file_path in html_files:
            if any(skip_dir in str(file_path) for skip_dir in skip_dirs):
                continue
            self._extract_html_sections(file_path)

        # Index JavaScript files
        js_files = list(self.project_root.rglob("*.js"))
        for file_path in js_files:
            if any(skip_dir in str(file_path) for skip_dir in skip_dirs):
                continue
            self._extract_js_functions(file_path)

        # Index CSS files
        css_files = list(self.project_root.rglob("*.css"))
        for file_path in css_files:
            if any(skip_dir in str(file_path) for skip_dir in skip_dirs):
                continue
            self._extract_css_rules(file_path)

        print(f"✅ Indexed {len(self.code_chunks)} code chunks")

    def _extract_html_sections(self, file_path: Path):
        """Extract HTML sections and components"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Find sections with ID or class
            section_pattern = r'<(section|div|nav|header|footer)[^>]*(?:id|class)=["\']([^"\']+)["\'][^>]*>'

            for match in re.finditer(section_pattern, content, re.IGNORECASE):
                tag = match.group(1)
                identifier = match.group(2)
                start_line = content[:match.start()].count('\n') + 1

                # Get surrounding context
                context_start = max(0, start_line - 5)
                context_end = min(len(lines), start_line + 15)
                context = '\n'.join(lines[context_start:context_end])

                self.code_chunks.append(SearchResult(
                    name=f"{tag}-{identifier}",
                    file_path=str(file_path),
                    line_number=start_line,
                    content=context,
                    file_type='html',
                    score=0.0
                ))

            # Find forms
            form_pattern = r'<form[^>]*>'
            for match in re.finditer(form_pattern, content, re.IGNORECASE):
                start_line = content[:match.start()].count('\n') + 1
                context_start = max(0, start_line - 2)
                context_end = min(len(lines), start_line + 20)
                context = '\n'.join(lines[context_start:context_end])

                self.code_chunks.append(SearchResult(
                    name="form-element",
                    file_path=str(file_path),
                    line_number=start_line,
                    content=context,
                    file_type='html',
                    score=0.0
                ))

        except Exception as e:
            print(f"⚠️  Error processing {file_path}: {e}")

    def _extract_js_functions(self, file_path: Path):
        """Extract JavaScript functions"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Function patterns
            patterns = [
                r'function\s+(\w+)\s*\(',
                r'const\s+(\w+)\s*=\s*\(',
                r'(\w+)\s*:\s*function\s*\(',
            ]

            for pattern in patterns:
                for match in re.finditer(pattern, content):
                    func_name = match.group(1)
                    start_line = content[:match.start()].count('\n') + 1

                    # Get function context
                    context_start = max(0, start_line - 2)
                    context_end = min(len(lines), start_line + 15)
                    context = '\n'.join(lines[context_start:context_end])

                    self.code_chunks.append(SearchResult(
                        name=func_name,
                        file_path=str(file_path),
                        line_number=start_line,
                        content=context,
                        file_type='js',
                        score=0.0
                    ))

        except Exception as e:
            print(f"⚠️  Error processing {file_path}: {e}")

    def _extract_css_rules(self, file_path: Path):
        """Extract CSS rules"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # CSS selector pattern
            css_pattern = r'([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*\{'

            for match in re.finditer(css_pattern, content):
                selector = match.group(1)
                start_line = content[:match.start()].count('\n') + 1

                # Get CSS rule context
                context_start = max(0, start_line - 1)
                context_end = min(len(lines), start_line + 10)
                context = '\n'.join(lines[context_start:context_end])

                self.code_chunks.append(SearchResult(
                    name=f"css-{selector}",
                    file_path=str(file_path),
                    line_number=start_line,
                    content=context,
                    file_type='css',
                    score=0.0
                ))

        except Exception as e:
            print(f"⚠️  Error processing {file_path}: {e}")

    def search(self, query: str, file_type: str = None, top_k: int = 10) -> List[SearchResult]:
        """Search using keyword matching"""
        if not self.code_chunks:
            print("❌ No code indexed yet!")
            return []

        query_words = query.lower().split()
        results = []

        for chunk in self.code_chunks:
            if file_type and chunk.file_type != file_type:
                continue

            # Calculate simple keyword score
            score = 0.0
            text = f"{chunk.name} {chunk.content}".lower()

            for word in query_words:
                if word in text:
                    score += 1.0
                    # Bonus for exact matches in name
                    if word in chunk.name.lower():
                        score += 2.0

            if score > 0:
                chunk.score = score / len(query_words)  # Normalize
                results.append(chunk)

        # Sort by score
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    def interactive_search(self):
        """Interactive search mode"""
        print("🔄 Indexing project...")
        self.index_project()

        if not self.code_chunks:
            print("❌ No code found!")
            return

        print(f"\n✅ Ready! Found {len(self.code_chunks)} code chunks")
        print("\n💡 Try searches like:")
        print("   • 'navigation menu'")
        print("   • 'contact form'")
        print("   • 'pricing'")
        print("   • 'footer'")

        while True:
            try:
                query = input("\n🔍 Search: ").strip()

                if query.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break

                if not query:
                    continue

                results = self.search(query)
                self._display_results(results, query)

            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break

    def _display_results(self, results: List[SearchResult], query: str):
        """Display search results"""
        if not results:
            print("❌ No results found")
            return

        print(f"\n📋 Found {len(results)} results for '{query}':")

        for i, result in enumerate(results, 1):
            file_name = Path(result.file_path).name
            print(f"\n{i}. 📄 {result.name} (score: {result.score:.2f})")
            print(f"   📍 {file_name}:{result.line_number}")
            print(f"   🏷️  {result.file_type.upper()}")

            # Show code preview
            lines = result.content.split('\n')
            for j, line in enumerate(lines[:4]):
                print(f"   {result.line_number + j:4d} | {line[:80]}")

            if len(lines) > 4:
                print(f"   ... ({len(lines) - 4} more lines)")

def main():
    """Main function"""
    search_engine = SimpleTTPSearch()

    if len(os.sys.argv) > 1:
        if os.sys.argv[1] == "search" and len(os.sys.argv) > 2:
            query = " ".join(os.sys.argv[2:])
            search_engine.index_project()
            results = search_engine.search(query)
            search_engine._display_results(results, query)
        else:
            print("Usage: python3 simple_tpp_search.py [search <query>]")
    else:
        search_engine.interactive_search()

if __name__ == "__main__":
    main()