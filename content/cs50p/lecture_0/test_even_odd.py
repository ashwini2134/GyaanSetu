import subprocess

def test_even():
    result = subprocess.run(['python', 'solution.py'], input="4\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "Even" in result.stdout or "even" in result.stdout.lower(), "Expected Even"

def test_odd():
    result = subprocess.run(['python', 'solution.py'], input="7\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "Odd" in result.stdout or "odd" in result.stdout.lower(), "Expected Odd"

def test_zero():
    result = subprocess.run(['python', 'solution.py'], input="0\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "Even" in result.stdout or "even" in result.stdout.lower(), "Expected Even"
