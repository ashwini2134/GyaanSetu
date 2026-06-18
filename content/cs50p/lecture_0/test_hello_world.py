import subprocess

def test_hello_world():
    result = subprocess.run(['python', 'solution.py'], capture_output=True, text=True)
    assert result.returncode == 0, "Script failed to run."
    assert "Hello World" in result.stdout, f"Expected 'Hello World', got '{result.stdout.strip()}'"
