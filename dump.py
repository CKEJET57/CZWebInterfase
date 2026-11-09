import os
from pathlib import Path

# Настройки
PROJECT_DIR = "."
DUMP_FILE = "project_dump.txt"

# Папки, которые нужно игнорировать
IGNORE_DIRS = {'.git', 'node_modules', 'dist', 'build', '.vscode', '.idea'}

# Расширения файлов, которые нужно сохранить
TEXT_EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.txt', '.py'}

def create_text_dump():
    print(f"Создаем файл: {DUMP_FILE}...")
    
    with open(DUMP_FILE, 'w', encoding='utf-8') as outfile:
        outfile.write("====== ДАМП ПРОЕКТА ======\n\n")
        
        for root, dirs, files in os.walk(PROJECT_DIR):
            # Исключаем ненужные папки из обхода
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                filepath = Path(root) / file
                ext = filepath.suffix
                
                # Пропускаем сам скрипт и создаваемый файл
                if file in [DUMP_FILE, 'dump.py']:
                    continue
                
                if ext in TEXT_EXTENSIONS:
                    # Красивый путь (без "./" в начале)
                    rel_path = filepath.relative_to(PROJECT_DIR)
                    
                    outfile.write(f"{'='*60}\n")
                    outfile.write(f"ФАЙЛ: {rel_path}\n")
                    outfile.write(f"{'='*60}\n")
                    
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            outfile.write(f.read())
                    except Exception as e:
                        outfile.write(f"[Ошибка чтения файла: {e}]")
                        
                    outfile.write("\n\n")
                    
    print("✅ Готово! Файл создан.")

if __name__ == "__main__":
    if not os.path.exists("package.json"):
        print("⚠️ Внимание: package.json не найден. Возможно, вы не в корне проекта.")
        proceed = input("Продолжить? (y/n): ")
        if proceed.lower() != 'y':
            exit()

    create_text_dump()