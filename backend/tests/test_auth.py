import pytest

def test_user_registration(client):
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_user_login(client):
    # Ensure user exists (transaction handles rollback so we need them in same test or use a fixture)
    client.post("/api/auth/register", json={
        "email": "login@example.com",
        "password": "password123",
        "name": "Login User"
    })
    
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_protected_endpoint_unauthorized(client):
    response = client.get("/api/portfolio/summary")
    assert response.status_code == 401 # Should fail without token

def test_protected_endpoint_authorized(client):
    # Register and login to get token
    client.post("/api/auth/register", json={
        "email": "auth@example.com",
        "password": "password123",
        "name": "Auth User"
    })
    login_res = client.post("/api/auth/login", json={
        "email": "auth@example.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/portfolio/summary", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "total_balance" in response.json()
