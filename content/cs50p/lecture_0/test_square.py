import subprocess

def test_square_positive():
    result = subprocess.run(['python', 'solution.py'], input="5\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "25" in result.stdout, "Expected 25"

def test_square_negative():
    result = subprocess.run(['python', 'solution.py'], input="-3\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "9" in result.stdout, "Expected 9"

def test_square_zero():
    result = subprocess.run(['python', 'solution.py'], input="0\n", capture_output=True, text=True)
    assert result.returncode == 0
    assert "0" in result.stdout, "Expected 0"
