import os

def resolve_conflicts_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        skip_mode = False
        in_head_mode = False
        has_conflict = False
        
        for line in lines:
            if line.startswith('<<<<<<< HEAD'):
                in_head_mode = True
                has_conflict = True
                continue
            elif line.startswith('======='):
                in_head_mode = False
                skip_mode = True
                continue
            elif line.startswith('>>>>>>>'):
                skip_mode = False
                continue
            
            if in_head_mode:
                new_lines.append(line)
            elif not skip_mode:
                new_lines.append(line)
        
        if has_conflict:
            print(f"Resolving conflicts in: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    target_dir = r"c:\Users\USER\Downloads\Strapre-main\Strapre-main"
    for root, dirs, files in os.walk(target_dir):
        if '.git' in dirs:
            dirs.remove('.git')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
            
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.json', '.xml', '.txt', '.html', '.css')):
                file_path = os.path.join(root, file)
                resolve_conflicts_in_file(file_path)

if __name__ == "__main__":
    main()
