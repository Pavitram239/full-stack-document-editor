import os
import html

def parse_uploaded_file(file_obj, filename):
    """
    Parses uploaded .txt, .md, or .docx file and returns (clean_title, html_content).
    """
    base_name, ext = os.path.splitext(filename)
    ext = ext.lower()
    clean_title = base_name.replace('_', ' ').replace('-', ' ').strip().title() or "Imported Document"

    html_content = ""

    if ext == '.txt':
        raw_bytes = file_obj.read()
        try:
            text = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            text = raw_bytes.decode('latin-1', errors='ignore')
        
        lines = text.splitlines()
        paragraphs = [f"<p>{html.escape(line)}</p>" for line in lines if line.strip()]
        html_content = "".join(paragraphs) if paragraphs else "<p></p>"

    elif ext == '.md':
        raw_bytes = file_obj.read()
        try:
            text = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            text = raw_bytes.decode('latin-1', errors='ignore')

        try:
            import markdown
            html_content = markdown.markdown(text, extensions=['extra', 'nl2br'])
        except Exception:
            lines = text.splitlines()
            html_content = "".join([f"<p>{html.escape(l)}</p>" for l in lines if l.strip()])

    elif ext == '.docx':
        try:
            import docx
            doc = docx.Document(file_obj)
            p_list = []
            for p in doc.paragraphs:
                if not p.text.strip():
                    continue
                escaped_text = html.escape(p.text.strip())
                if p.style.name.startswith('Heading 1'):
                    p_list.append(f"<h1>{escaped_text}</h1>")
                elif p.style.name.startswith('Heading 2'):
                    p_list.append(f"<h2>{escaped_text}</h2>")
                elif p.style.name.startswith('Heading 3'):
                    p_list.append(f"<h3>{escaped_text}</h3>")
                elif p.style.name.startswith('List'):
                    p_list.append(f"<ul><li>{escaped_text}</li></ul>")
                else:
                    p_list.append(f"<p>{escaped_text}</p>")
            html_content = "".join(p_list) if p_list else "<p></p>"
        except Exception as e:
            # Fallback if docx reading fails
            file_obj.seek(0)
            raw = file_obj.read()
            html_content = f"<p>Imported DOCX File: {html.escape(filename)}</p>"
    else:
        # Generic fallback
        raw_bytes = file_obj.read()
        try:
            text = raw_bytes.decode('utf-8', errors='ignore')
            lines = text.splitlines()
            html_content = "".join([f"<p>{html.escape(l)}</p>" for l in lines if l.strip()])
        except Exception:
            html_content = f"<p>Imported file: {html.escape(filename)}</p>"

    return clean_title, html_content
