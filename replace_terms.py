import os

directory = "c:/Users/Sanatorio Argentino/Desktop/Proyectos/advpr"

replacements = {
    "Neumáticos Gallo": "Adventure Pro",
    "neumáticos": "eventos",
    "Neumáticos": "Eventos",
    "neumático": "evento",
    "Neumático": "Evento",
    "Gallo neumáticos": "Adventure Pro",
    "Gallo": "Adventure Pro",
    "NEUMATICOS.GALLO": "ADVENTURE.PRO",
    "llanta": "carrera",
    "Llantas": "Carreras",
    "llantas": "carreras",
    "vehículos": "participantes",
    "vehículo": "participante",
    "Vehículos": "Participantes",
    "autos": "participantes",
    "auto": "participante",
    "Autos": "Participantes",
    "Rotación de neumáticos": "Inscripción a carrera",
    "Alineación y balanceo": "Acreditación de equipo",
    "Cambio de aceite": "Entrega de kit"
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk(directory):
    if "node_modules" in root or ".git" in root or "dist" in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.json', '.sql', '.html', '.css', '.md')):
            replace_in_file(os.path.join(root, file))

print("Term replacements completed.")
