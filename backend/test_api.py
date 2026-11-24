from starlette.testclient import TestClient
from main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /api/auth/current...")
    r = client.get("/api/auth/current")
    assert r.status_code == 200, f"Failed: {r.text}"
    user = r.json()
    print(f"Current user: {user['name_ar']} ({user['role']})")

    print("Testing /api/patients...")
    r = client.get("/api/patients")
    assert r.status_code == 200
    patients = r.json()
    print(f"Total patients: {len(patients)}")
    assert len(patients) >= 3

    print("Testing /api/patients/101 details...")
    r = client.get("/api/patients/101")
    assert r.status_code == 200
    p101 = r.json()
    assert len(p101["vitals"]) >= 3
    assert len(p101["medications"]) >= 3
    assert len(p101["labs"]) >= 3
    print("Patient 101 EHR retrieved successfully.")

    print("Testing AI SBAR Handover generation for Patient 101...")
    r = client.post("/api/handover/generate/101")
    assert r.status_code == 200
    res = r.json()
    assert "sbar" in res
    assert "situation" in res["sbar"]
    assert "validation" in res
    print("SBAR Generated successfully:")
    print("  Situation:", res["sbar"]["situation"][:80], "...")
    print("  Validation status:", res["validation"]["status"])

    print("Testing Missing Information detector for Patient 101...")
    r = client.post("/api/handover/validate/101")
    assert r.status_code == 200
    val = r.json()
    print(f"Validation warnings found: {val['total_warnings']}, Status: {val['status']}")

    print("Testing Supervisor Analytics...")
    r = client.get("/api/supervisor/analytics")
    assert r.status_code == 200
    analytics = r.json()
    print(f"Total handovers: {analytics['total_handovers']}, Ack rate: {analytics['acknowledgment_rate']}%")

    print("\nALL BACKEND UNIT TESTS PASSED!")

if __name__ == "__main__":
    test_endpoints()
