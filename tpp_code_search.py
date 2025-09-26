#!/usr/bin/env python3
"""
TPP Website Vector Code Search
Specialized implementation for the TPP website project

Usage:
    python tpp_code_search.py
    python tpp_code_search.py interactive
    python tpp_code_search.py search "navigation function"
"""

import os
import re
import sys
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict
from dataclasses import dataclass
import json

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("❌ Missing dependencies!")
    print("📦 Install with: pip install sentence-transformers numpy")
    sys.exit(1)

@dataclass
class TPPCodeResult:
    name: str
    file_path: str
    line_number: int
    code: str
    score: float
    file_type: str
    category: str = ""

class TPPCodeSearch:
    def __init__(self):
        print("🚀 TPP Website Code Search")
        print("Loading AI model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.code_chunks = []
        self.embeddings = []
        self.project_root = Path(__file__).parent
        print("✅ Ready!")

    def index_tpp_project(self):
        """Index the entire TPP website project"""
        print(f"📂 Indexing TPP project at: {self.project_root}")

        # Define file types and their categories
        file_patterns = {
            'html': {'pattern': '*.html', 'category': 'Frontend/Templates'},
            'css': {'pattern': '*.css', 'category': 'Styling'},
            'js': {'pattern': '*.js', 'category': 'JavaScript/Logic'},
            'py': {'pattern': '*.py', 'category': 'Python/Scripts'},
            'json': {'pattern': '*.json', 'category': 'Configuration'},
            'md': {'pattern': '*.md', 'category': 'Documentation'}
        }

        # Directories to skip
        skip_dirs = {
            '.git', '__pycache__', 'node_modules', '.venv', 'test-results',
            'playwright-report', '.claude-flow', '.hive-mind', '.swarm'
        }

        for file_type, config in file_patterns.items():
            files = list(self.project_root.rglob(config['pattern']))

            for file_path in files:
                # Skip if in excluded directory
                if any(skip_dir in str(file_path) for skip_dir in skip_dirs):
                    continue

                if file_type == 'html':
                    self._extract_html_components(file_path, config['category'])
                elif file_type == 'js':
                    self._extract_js_functions(file_path, config['category'])
                elif file_type == 'css':
                    self._extract_css_rules(file_path, config['category'])
                elif file_type == 'py':
                    self._extract_python_functions(file_path, config['category'])
                elif file_type == 'json':
                    self._extract_json_structure(file_path, config['category'])
                elif file_type == 'md':
                    self._extract_md_sections(file_path, config['category'])

        if self.code_chunks:
            print(f"🔍 Generating embeddings for {len(self.code_chunks)} code chunks...")
            texts = [f"{chunk.name}\n{chunk.code}" for chunk in self.code_chunks]
            self.embeddings = self.model.encode(texts, show_progress_bar=True)

            # Show statistics
            stats = self._get_stats()
            print(f"✅ Indexed {len(self.code_chunks)} chunks:")
            for category, count in stats['categories'].items():
                print(f"   📋 {category}: {count}")
        else:
            print("❌ No code chunks found!")

    def _extract_html_components(self, file_path: Path, category: str):
        """Extract HTML sections, forms, and components"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Extract sections with IDs or classes
            section_pattern = r'<(section|div|header|footer|nav|main|article)[^>]*(?:id|class)=["\']([^"\']+)["\'][^>]*>'

            for match in re.finditer(section_pattern, content, re.IGNORECASE):
                tag = match.group(1)
                identifier = match.group(2)
                start_line = content[:match.start()].count('\n') + 1

                # Find end tag (simplified)
                end_pos = content.find(f'</{tag}>', match.end())
                if end_pos != -1:
                    end_line = content[:end_pos].count('\n') + 1
                    section_content = '\n'.join(lines[start_line-1:min(end_line+1, len(lines))])

                    # Limit content length
                    if len(section_content) > 1000:
                        section_content = section_content[:1000] + "..."

                    self.code_chunks.append(TPPCodeResult(
                        name=f"{tag}#{identifier}",
                        file_path=str(file_path),
                        line_number=start_line,
                        code=section_content,
                        score=0.0,
                        file_type='html',
                        category=category
                    ))

            # Extract forms
            form_pattern = r'<form[^>]*>'
            for match in re.finditer(form_pattern, content, re.IGNORECASE):
                start_line = content[:match.start()].count('\n') + 1
                end_pos = content.find('</form>', match.end())
                if end_pos != -1:
                    end_line = content[:end_pos].count('\n') + 1
                    form_content = '\n'.join(lines[start_line-1:min(end_line+1, len(lines))])

                    # Extract form action or name
                    action_match = re.search(r'action=["\']([^"\']+)["\']', match.group(0))
                    form_name = action_match.group(1) if action_match else "form"

                    self.code_chunks.append(TPPCodeResult(
                        name=f"form-{form_name}",
                        file_path=str(file_path),
                        line_number=start_line,
                        code=form_content[:500] + ("..." if len(form_content) > 500 else ""),
                        score=0.0,
                        file_type='html',
                        category=category
                    ))

        except Exception as e:
            print(f"⚠️  Error processing HTML {file_path}: {e}")

    def _extract_js_functions(self, file_path: Path, category: str):
        """Extract JavaScript functions"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Function patterns
            patterns = [
                (r'function\s+(\w+)\s*\([^)]*\)\s*\{', 'function'),
                (r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{', 'arrow-function'),
                (r'(\w+)\s*:\s*function\s*\([^)]*\)\s*\{', 'method'),
                (r'(\w+)\s*\([^)]*\)\s*\{', 'method-shorthand')
            ]

            for pattern, func_type in patterns:
                for match in re.finditer(pattern, content):
                    func_name = match.group(1)
                    start_line = content[:match.start()].count('\n') + 1

                    # Find function end (simple brace matching)
                    pos = match.end()
                    brace_count = 1
                    while pos < len(content) and brace_count > 0:
                        if content[pos] == '{':
                            brace_count += 1
                        elif content[pos] == '}':
                            brace_count -= 1
                        pos += 1

                    end_line = content[:pos].count('\n') + 1
                    func_content = '\n'.join(lines[start_line-1:min(end_line, len(lines))])

                    self.code_chunks.append(TPPCodeResult(
                        name=func_name,
                        file_path=str(file_path),
                        line_number=start_line,
                        code=func_content[:800] + ("..." if len(func_content) > 800 else ""),
                        score=0.0,
                        file_type='js',
                        category=category
                    ))

        except Exception as e:
            print(f"⚠️  Error processing JS {file_path}: {e}")

    def _extract_css_rules(self, file_path: Path, category: str):
        """Extract CSS rules and classes"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # CSS rule pattern
            css_pattern = r'([^{]+)\s*\{'

            for match in re.finditer(css_pattern, content):
                selector = match.group(1).strip()
                if not selector or selector.startswith('/*'):
                    continue

                start_line = content[:match.start()].count('\n') + 1

                # Find rule end
                pos = match.end()
                brace_count = 1
                while pos < len(content) and brace_count > 0:
                    if content[pos] == '{':
                        brace_count += 1
                    elif content[pos] == '}':
                        brace_count -= 1
                    pos += 1

                end_line = content[:pos].count('\n') + 1
                rule_content = '\n'.join(lines[start_line-1:min(end_line, len(lines))])

                # Clean selector name for display
                selector_name = selector.replace('\n', ' ').strip()[:50]

                self.code_chunks.append(TPPCodeResult(
                    name=f"css-{selector_name}",
                    file_path=str(file_path),
                    line_number=start_line,
                    code=rule_content[:400] + ("..." if len(rule_content) > 400 else ""),
                    score=0.0,
                    file_type='css',
                    category=category
                ))

        except Exception as e:
            print(f"⚠️  Error processing CSS {file_path}: {e}")

    def _extract_python_functions(self, file_path: Path, category: str):
        """Extract Python functions (similar to previous implementation)"""
        try:
            content = file_path.read_text(encoding='utf-8')

            # Simple function extraction
            func_pattern = r'^def\s+(\w+)\s*\([^)]*\):.*?(?=^def|\Z)'
            matches = re.finditer(func_pattern, content, re.MULTILINE | re.DOTALL)

            for match in matches:
                func_name = match.group(1)
                start_line = content[:match.start()].count('\n') + 1
                func_content = match.group(0)

                self.code_chunks.append(TPPCodeResult(
                    name=func_name,
                    file_path=str(file_path),
                    line_number=start_line,
                    code=func_content[:600] + ("..." if len(func_content) > 600 else ""),
                    score=0.0,
                    file_type='py',
                    category=category
                ))

        except Exception as e:
            print(f"⚠️  Error processing Python {file_path}: {e}")

    def _extract_json_structure(self, file_path: Path, category: str):
        """Extract JSON configuration sections"""
        try:
            content = file_path.read_text(encoding='utf-8')

            try:
                data = json.loads(content)

                # Extract top-level keys as chunks
                if isinstance(data, dict):
                    for key, value in data.items():
                        value_str = json.dumps(value, indent=2)[:300]

                        self.code_chunks.append(TPPCodeResult(
                            name=f"config-{key}",
                            file_path=str(file_path),
                            line_number=1,
                            code=f'"{key}": {value_str}',
                            score=0.0,
                            file_type='json',
                            category=category
                        ))

            except json.JSONDecodeError:
                pass  # Skip invalid JSON

        except Exception as e:
            print(f"⚠️  Error processing JSON {file_path}: {e}")

    def _extract_md_sections(self, file_path: Path, category: str):
        """Extract Markdown sections"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Find headers
            header_pattern = r'^(#{1,6})\s+(.+)$'

            for i, line in enumerate(lines):
                match = re.match(header_pattern, line)
                if match:
                    level = len(match.group(1))
                    title = match.group(2)

                    # Get section content (until next header of same or higher level)
                    section_lines = [line]
                    for j in range(i + 1, len(lines)):
                        next_line = lines[j]
                        next_match = re.match(header_pattern, next_line)
                        if next_match and len(next_match.group(1)) <= level:
                            break
                        section_lines.append(next_line)

                    section_content = '\n'.join(section_lines[:20])  # Limit to 20 lines

                    self.code_chunks.append(TPPCodeResult(
                        name=f"doc-{title}",
                        file_path=str(file_path),
                        line_number=i + 1,
                        code=section_content,
                        score=0.0,
                        file_type='md',
                        category=category
                    ))

        except Exception as e:
            print(f"⚠️  Error processing Markdown {file_path}: {e}")

    def search(self, query: str, top_k: int = 10, file_type: str = None) -> List[TPPCodeResult]:
        """Search the TPP codebase"""
        if not self.code_chunks:
            print("❌ No code indexed yet! Run index_tpp_project() first.")
            return []

        print(f"🔍 Searching TPP codebase for: '{query}'")

        # Get query embedding
        query_embedding = self.model.encode([query])[0]

        # Calculate similarities
        scores = []
        for i, chunk_embedding in enumerate(self.embeddings):
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )

            chunk = self.code_chunks[i]

            # Filter by file type if specified
            if file_type and chunk.file_type != file_type:
                continue

            chunk.score = similarity
            scores.append((similarity, chunk))

        # Sort and return top results
        scores.sort(reverse=True)
        return [chunk for _, chunk in scores[:top_k]]

    def _get_stats(self) -> Dict:
        """Get indexing statistics"""
        stats = {
            'total': len(self.code_chunks),
            'file_types': {},
            'categories': {}
        }

        for chunk in self.code_chunks:
            stats['file_types'][chunk.file_type] = stats['file_types'].get(chunk.file_type, 0) + 1
            stats['categories'][chunk.category] = stats['categories'].get(chunk.category, 0) + 1

        return stats

    def interactive_search(self):
        """Interactive search mode"""
        if not self.code_chunks:
            print("🔄 Indexing TPP project first...")
            self.index_tpp_project()

        if not self.code_chunks:
            print("❌ No code found to search!")
            return

        print(f"\n✅ Ready! Indexed {len(self.code_chunks)} code chunks")
        print("\n💡 Try searches like:")
        print("   • 'navigation menu'")
        print("   • 'contact form'")
        print("   • 'pricing section'")
        print("   • 'seo optimization'")
        print("   • 'performance monitoring'")
        print("\n📝 Commands:")
        print("   • search <query>")
        print("   • filter html <query>  (search only HTML)")
        print("   • filter js <query>    (search only JavaScript)")
        print("   • stats               (show statistics)")
        print("   • quit                (exit)")

        while True:
            try:
                user_input = input("\n🔍 TPP Search > ").strip()

                if not user_input:
                    continue

                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break

                elif user_input.lower() == 'stats':
                    stats = self._get_stats()
                    print(f"\n📊 TPP Codebase Statistics:")
                    print(f"   Total chunks: {stats['total']}")
                    print("   By file type:")
                    for file_type, count in stats['file_types'].items():
                        print(f"     {file_type}: {count}")

                elif user_input.startswith('filter '):
                    parts = user_input.split(' ', 2)
                    if len(parts) >= 3:
                        file_type, query = parts[1], parts[2]
                        results = self.search(query, top_k=5, file_type=file_type)
                        self._display_results(results, query)
                    else:
                        print("Usage: filter <type> <query>")

                elif user_input.startswith('search '):
                    query = user_input[7:]  # Remove 'search '
                    results = self.search(query, top_k=8)
                    self._display_results(results, query)

                else:
                    # Default to search
                    results = self.search(user_input, top_k=8)
                    self._display_results(results, user_input)

            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break

    def _display_results(self, results: List[TPPCodeResult], query: str):
        """Display search results nicely"""
        if not results:
            print("❌ No results found")
            return

        print(f"\n📋 Found {len(results)} results for '{query}':")

        for i, result in enumerate(results, 1):
            file_name = Path(result.file_path).name
            print(f"\n{i}. 📄 {result.name} (score: {result.score:.3f})")
            print(f"   📍 {file_name}:{result.line_number}")
            print(f"   🏷️  {result.file_type.upper()} | {result.category}")

            # Show code preview
            lines = result.code.split('\n')
            preview_lines = min(4, len(lines))

            for j, line in enumerate(lines[:preview_lines]):
                line_num = result.line_number + j
                print(f"   {line_num:4d} | {line[:80]}")

            if len(lines) > preview_lines:
                print(f"   ... ({len(lines) - preview_lines} more lines)")

def main():
    """Main function"""
    search_engine = TPPCodeSearch()

    if len(sys.argv) > 1:
        if sys.argv[1] == "interactive":
            search_engine.interactive_search()
        elif sys.argv[1] == "search" and len(sys.argv) > 2:
            query = " ".join(sys.argv[2:])
            search_engine.index_tpp_project()
            results = search_engine.search(query)
            search_engine._display_results(results, query)
        else:
            print("Usage: python tpp_code_search.py [interactive|search <query>]")
    else:
        # Default to interactive
        search_engine.interactive_search()

if __name__ == "__main__":
    main()