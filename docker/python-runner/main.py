import traceback

try:
    with open('code.py', 'r') as file:
        exec(file.read())
except Exception as e:
    traceback.print_exc()
