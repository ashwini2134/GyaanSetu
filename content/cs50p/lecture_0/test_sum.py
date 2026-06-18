import subprocess

def test_sum():
    # Test case 1
    result1 = subprocess.run(['python', 'solution.py'], input="5\n10\n", capture_output=True, text=True)
    assert result1.returncode == 0, "Script failed to run."
    assert "15" in result1.stdout, f"Expected 15, got {result1.stdout.strip()}"

    # Test case 2
    result2 = subprocess.run(['python', 'solution.py'], input="-5\n5\n", capture_output=True, text=True)
    assert result2.returncode == 0
    assert "0" in result2.stdout, f"Expected 0, got {result2.stdout.strip()}"
