from adapters.python.petdots import PetDots

pets = PetDots(project="my-repository")
pets.emit("backend", "working", "Procesando la tarea", evidence=["src/api.py"])
# Emit done only after the command or test has really terminado.
pets.emit("backend", "done", "Pruebas completadas", evidence=["pytest -q"])
