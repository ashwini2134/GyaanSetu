import subprocess

def test_add():
    result = subprocess.run(['python', 'solution.py'], input="10\n5\n+\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "15" in result.stdout, "Expected 15 for 10 + 5"

def test_subtract():
    result = subprocess.run(['python', 'solution.py'], input="10\n5\n-\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "5" in result.stdout, "Expected 5 for 10 - 5"

def test_multiply():
    result = subprocess.run(['python', 'solution.py'], input="10\n5\n*\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "50" in result.stdout, "Expected 50 for 10 * 5"

def test_divide():
    result = subprocess.run(['python', 'solution.py'], input="10\n5\n/\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "2" in result.stdout or "2.0" in result.stdout, "Expected 2 or 2.0 for 10 / 5"
