import re
import html
import subprocess
import os
import shutil

def clean_text(text):
    # Strip HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    # Decode HTML entities
    text = html.unescape(text)
    text = text.replace('&nbsp;', ' ')
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    if text == '.':
        return ""
    return text

def parse_html_poems():
    html_path = '/home/lukadsant/wslcode/bleach-poem/docs/poems_all.html'
    if not os.path.exists(html_path):
        html_path = 'docs/poems_all.html'
        
    if not os.path.exists(html_path):
        print("File not found:", html_path)
        return {}
        
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    articles = re.findall(r'<article class="poem-card" id="vol-(\d+)">(.*?)</article>', content, re.DOTALL)
    
    poems = {}
    for vol_str, body in articles:
        vol_num = int(vol_str)
        
        # Extract title
        title_match = re.search(r'<h2 class="poem-title">([^<]+)</h2>', body)
        title = title_match.group(1).strip() if title_match else f"Volume {vol_num}"
        
        # Extract character
        char_match = re.search(r'<p class="poem-character"><strong>Personagem:</strong>\s*([^<]+)</p>', body, re.IGNORECASE)
        character = char_match.group(1).strip() if char_match else "Unknown"
        
        # Extract JP and Romaji from <div class="poem-text jp">...</div>
        jp_match = re.search(r'<div class="poem-text jp">(.*?)</div>', body, re.DOTALL)
        jp_lines = []
        ro_lines = []
        if jp_match:
            jp_raw = jp_match.group(1)
            ro_lines = [clean_text(m) for m in re.findall(r'<span class="romaji-line">(.*?)</span>', jp_raw)]
            jp_clean = re.sub(r'<span class="romaji-line">.*?</span>', '', jp_raw)
            jp_lines = [clean_text(line) for line in jp_clean.split('\n') if clean_text(line)]
        
        # Extract EN from Tradução (Inglês)
        en_match = re.search(r'<h3>Tradução \(Inglês\)</h3>\s*<div class="poem-text">(.*?)</div>', body, re.DOTALL)
        en = en_match.group(1).strip() if en_match else ""
        
        poems[vol_num] = {
            "title": title,
            "character": character,
            "jp": "\n".join(jp_lines),
            "ro": "\n".join(ro_lines),
            "en": en
        }
        
    return poems

def parse_pt_poems():
    pt_path = '/home/lukadsant/wslcode/bleach-poem/docs/poemaspt.txt'
    if not os.path.exists(pt_path):
        pt_path = 'docs/poemaspt.txt'
        
    with open(pt_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    pt_poems = {}
    current_vol = None
    lines_list = []
    vol_title = ""
    
    for line in lines:
        line_stripped = line.rstrip('\r\n')
        # Match header, e.g. "Volume 1: The..." or "Bleach - Volume 2..."
        match = re.search(r'\bVolume\s+(\d+)\b', line_stripped)
        
        if match:
            vol = int(match.group(1))
            if vol != current_vol:
                # Save previous volume
                if current_vol is not None:
                    while lines_list and not lines_list[-1].strip():
                        lines_list.pop()
                    pt_poems[current_vol] = {
                        "content_pt": "\n".join(lines_list),
                        "title": vol_title
                    }
                current_vol = vol
                lines_list = []
                
                # Parse title from header line
                # e.g., "Bleach - Volume 51: Love me bitterly...Volume 51: ..."
                title_part = ""
                header_parts = line_stripped.split("Volume")
                if len(header_parts) > 1:
                    # Look at the content after "Volume X:"
                    sub_match = re.search(r'\bVolume\s+\d+:\s*(.*)', line_stripped)
                    if sub_match:
                        raw_title = sub_match.group(1).strip()
                        # Truncate at duplicate "Volume" indicator if any
                        clean_t = re.split(r'Volume\s+\d+', raw_title, flags=re.IGNORECASE)[0].strip()
                        title_part = clean_t.rstrip(':- ').strip()
                vol_title = title_part
            else:
                continue
        else:
            if current_vol is not None:
                if not lines_list and not line_stripped.strip():
                    continue
                lines_list.append(line_stripped)
                
    # Save the last volume
    if current_vol is not None:
        while lines_list and not lines_list[-1].strip():
            lines_list.pop()
        pt_poems[current_vol] = {
            "content_pt": "\n".join(lines_list),
            "title": vol_title
        }
        
    return pt_poems

def merge_poems(html_poems, pt_poems):
    merged = []
    # Loop from volume 1 to 72 (based on the Portuguese translations we have)
    for i in range(1, 73):
        pt_data = pt_poems.get(i, {"content_pt": "", "title": f"Volume {i:02d}"})
        html_data = html_poems.get(i, None)
        
        title = html_data["title"] if html_data else pt_data["title"]
        character = html_data["character"] if html_data else "Tite Kubo"
        jp = html_data["jp"] if html_data else ""
        ro = html_data["ro"] if html_data else ""
        en = html_data["en"] if html_data else ""
        pt = pt_data["content_pt"]
        
        # fallback content is EN if available, otherwise PT
        content = en if en else pt
        
        merged.append({
            "id": i,
            "title": title if title else f"Volume {i:02d}",
            "character": character,
            "jp": jp,
            "ro": ro,
            "en": en,
            "pt": pt,
            "content": content
        })
        
    return merged

def generate_clean_html(poems):
    html_content = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bleach Poems Collection (Volumes 1—72)</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-paper: #f4f3ed;
            --ink-black: #1c1c1a;
            --ink-muted: #5e5e5b;
            --border-color: rgba(28, 28, 26, 0.15);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            background-color: var(--bg-paper);
            color: var(--ink-black);
            font-family: 'Outfit', sans-serif;
            line-height: 1.6;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 60px;
            padding-bottom: 30px;
            border-bottom: 2px solid var(--ink-black);
        }
        
        header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.8rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 1.1rem;
            color: var(--ink-muted);
            letter-spacing: 0.05em;
        }
        
        /* Table of Contents */
        .toc {
            background-color: rgba(28, 28, 26, 0.03);
            border: 1px solid var(--border-color);
            padding: 25px;
            margin-bottom: 60px;
            border-radius: 4px;
        }
        
        .toc h2 {
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 5px;
        }
        
        .toc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 10px;
        }
        
        .toc-item {
            display: block;
            text-align: center;
            padding: 6px;
            background-color: var(--bg-paper);
            border: 1px solid var(--border-color);
            text-decoration: none;
            color: var(--ink-black);
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        
        .toc-item:hover {
            background-color: var(--ink-black);
            color: var(--bg-paper);
        }
        
        /* Poem Entry */
        .poem-card {
            border: 2px solid var(--ink-black);
            padding: 40px;
            margin-bottom: 50px;
            background-color: #ffffff;
            box-shadow: 6px 6px 0px rgba(28, 28, 26, 0.1);
            position: relative;
        }
        
        .poem-header-container {
            display: flex;
            gap: 24px;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
        }
        
        .poem-cover {
            width: 80px;
            height: 120px;
            object-fit: cover;
            border: 2px solid var(--ink-black);
            box-shadow: 4px 4px 0px rgba(28, 28, 26, 0.15);
            background-color: #000;
        }
        
        .poem-header {
            flex-grow: 1;
        }
        
        .vol-badge {
            font-size: 0.9rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--ink-muted);
        }
        
        .poem-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            font-weight: 700;
            margin: 5px 0 10px;
        }
        
        .poem-character {
            font-size: 0.95rem;
            font-style: italic;
            color: var(--ink-muted);
        }
        
        .poem-character strong {
            font-style: normal;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.1em;
        }
        
        .poem-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        @media (max-width: 768px) {
            .poem-content-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .poem-header-container {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
        }
        
        .lang-col {
            display: flex;
            flex-direction: column;
        }
        
        .lang-col.full-width {
            grid-column: span 2;
        }
        
        @media (max-width: 768px) {
            .lang-col.full-width {
                grid-column: span 1;
            }
        }
        
        .lang-col h3 {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--ink-muted);
            margin-bottom: 15px;
            border-bottom: 1px dashed var(--border-color);
            padding-bottom: 5px;
        }
        
        .poem-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.25rem;
            line-height: 1.8;
            white-space: pre-wrap;
            color: var(--ink-black);
        }
        
        .poem-text.jp {
            font-family: 'Outfit', sans-serif;
            font-size: 1.15rem;
        }
        
        .romaji-line {
            display: block;
            font-size: 0.85rem;
            font-family: 'Outfit', sans-serif;
            color: var(--ink-muted);
            font-style: italic;
            margin-top: -2px;
            margin-bottom: 8px;
        }
        
        .back-to-top {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 0.8rem;
            color: var(--ink-muted);
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .back-to-top:hover {
            color: var(--ink-black);
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>BLEACH POEMS</h1>
            <p>Coleção completa dos poemas de abertura dos volumes 1 a 72</p>
        </header>
        
        <section class="toc">
            <h2>Índice de Volumes</h2>
            <div class="toc-grid">
"""
    
    for p in poems:
        html_content += f'                <a href="#vol-{p["id"]}" class="toc-item">{p["id"]:02d}</a>\n'
        
    html_content += """            </div>
        </section>
        
        <main>
"""
    
    for p in poems:
        cover_img_tag = ""
        cover_path = f'/home/lukadsant/wslcode/bleach-poem/docs/covers/cover_{p["id"]}.jpg'
        if os.path.exists(cover_path):
            cover_img_tag = f'<img class="poem-cover" src="covers/cover_{p["id"]}.jpg" alt="Volume {p["id"]:02d} Cover" />'
            
        html_content += f"""            <article class="poem-card" id="vol-{p["id"]}">
                <a href="#" class="back-to-top">Topo ↑</a>
                <div class="poem-header-container">
                    {cover_img_tag}
                    <div class="poem-header">
                        <span class="vol-badge">Volume {p["id"]:02d}</span>
                        <h2 class="poem-title">{p["title"]}</h2>
                        <p class="poem-character"><strong>Personagem:</strong> {p["character"]}</p>
                    </div>
                </div>
"""
        
        if p["jp"]:
            # Normal multi-lang structure
            jp_lines = p["jp"].split("\n")
            ro_lines = p["ro"].split("\n")
            jp_col_html = ""
            for i in range(len(jp_lines)):
                jp_line = jp_lines[i]
                ro_line = ro_lines[i] if i < len(ro_lines) else ""
                
                if not jp_line and not ro_line:
                    jp_col_html += "\n"
                else:
                    jp_col_html += f'{jp_line}'
                    if ro_line:
                        jp_col_html += f'\n<span class="romaji-line">{ro_line}</span>'
                    else:
                        jp_col_html += '\n'
                        
            html_content += f"""                <div class="poem-content-grid" style="margin-bottom: 25px;">
                    <div class="lang-col">
                        <h3>Original (Japonês / Romaji)</h3>
                        <div class="poem-text jp">{jp_col_html.strip()}</div>
                    </div>
                    <div class="lang-col">
                        <h3>Tradução (Inglês)</h3>
                        <div class="poem-text">{p["en"]}</div>
                    </div>
                </div>
"""
        
        # Portuguese translation block (always present)
        html_content += f"""                <div class="poem-content-grid">
                    <div class="lang-col full-width">
                        <h3>Tradução (Português)</h3>
                        <div class="poem-text">{p["pt"]}</div>
                    </div>
                </div>
            </article>
"""
        
    html_content += """        </main>
    </div>
</body>
</html>
"""
    
    dest_path = '/home/lukadsant/wslcode/bleach-poem/docs/poems_all.html'
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ Generated clean HTML file: {dest_path}")

    # Copy to frontend public folder so it can be served at http://localhost:5173/gallery.html
    public_path = '/home/lukadsant/wslcode/bleach-poem/frontend/public/gallery.html'
    try:
        shutil.copy(dest_path, public_path)
        print(f"✅ Copied gallery HTML file to frontend: {public_path}")
    except Exception as e:
        print(f"⚠️ Failed to copy gallery HTML: {e}")

def escape_sql_str(s):
    if not s:
        return 'NULL'
    escaped = s.replace("'", "''")
    return f"'{escaped}'"

def generate_sql_seed(poems):
    sql_lines = []
    sql_lines.append("-- Auto-generated seed file to clear and replace poems")
    sql_lines.append("BEGIN;")
    sql_lines.append("TRUNCATE TABLE poems RESTART IDENTITY CASCADE;")
    sql_lines.append("TRUNCATE TABLE authors RESTART IDENTITY CASCADE;")
    
    unique_authors = sorted(list(set(p["character"] for p in poems)))
    author_id_map = {}
    
    sql_lines.append("\n-- Seeding Authors")
    for a_id, author_name in enumerate(unique_authors, 1):
        author_id_map[author_name] = a_id
        sql_lines.append(f"INSERT INTO authors (id, name) VALUES ({a_id}, {escape_sql_str(author_name)});")
        
    sql_lines.append("\n-- Seeding Poems")
    for p in poems:
        p_id = p["id"]
        title = p["title"]
        character = p["character"]
        author_id = author_id_map[character]
        
        jp = p["jp"]
        ro = p["ro"]
        en = p["en"]
        pt = p["pt"]
        content = p["content"]
        
        sql_lines.append(
            f"INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES ("
            f"{p_id}, "
            f"{escape_sql_str(content)}, "
            f"{author_id}, "
            f"{escape_sql_str(jp)}, "
            f"{escape_sql_str(ro)}, "
            f"{escape_sql_str(en)}, "
            f"{escape_sql_str(pt)}"
            f");"
        )
        
    sql_lines.append("\n-- Synchronize auto-increment sequences")
    sql_lines.append("SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors));")
    sql_lines.append("SELECT setval('poems_id_seq', (SELECT MAX(id) FROM poems));")
    
    sql_lines.append("COMMIT;")
    
    dest_path = '/home/lukadsant/wslcode/bleach-poem/docs/seed_poems.sql'
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
    print(f"✅ Generated SQL seed file: {dest_path}")

if __name__ == '__main__':
    html_poems = parse_html_poems()
    print(f"Parsed {len(html_poems)} poems from HTML.")
    pt_poems = parse_pt_poems()
    print(f"Parsed {len(pt_poems)} poems from poemaspt.txt.")
    merged = merge_poems(html_poems, pt_poems)
    print(f"Merged into {len(merged)} complete poem entries.")
    generate_clean_html(merged)
    generate_sql_seed(merged)
