import os

directory = "c:/Users/Sanatorio Argentino/Desktop/Proyectos/advpr"

fixes = {
    "participanteFocus": "autoFocus",
    "overflow-y-participante": "overflow-y-auto",
    "overflow-x-participante": "overflow-x-auto",
    "overflow-participante": "overflow-auto",
    "mx-participante": "mx-auto",
    "my-participante": "my-auto",
    "mr-participante": "mr-auto",
    "ml-participante": "ml-auto",
    "mt-participante": "mt-auto",
    "mb-participante": "mb-auto",
    "w-participante": "w-auto",
    "h-participante": "h-auto",
    "participante-cols": "auto-cols",
    "participante-rows": "auto-rows",
    "participanteComplete": "autoComplete",
    "participantePlay": "autoPlay",
    "participantemátic": "automátic",
    "participantematiza": "automatiza"
}

def fix_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for bad, good in fixes.items():
            new_content = new_content.replace(bad, good)
            
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk(directory):
    if "node_modules" in root or ".git" in root or "dist" in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.json', '.sql', '.html', '.css', '.md')):
            fix_in_file(os.path.join(root, file))

print("Fixes applied.")
