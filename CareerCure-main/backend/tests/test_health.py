"""
Basic health check and API structure tests.
"""


class TestHealth:
    def test_root_endpoint(self, client):
        res = client.get("/")
        assert res.status_code == 200
        assert "CareerCure" in res.json()["message"]

    def test_health_endpoint(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    def test_docs_available(self, client):
        res = client.get("/docs")
        assert res.status_code == 200

    def test_openapi_schema(self, client):
        res = client.get("/openapi.json")
        assert res.status_code == 200
        schema = res.json()
        assert "paths" in schema
        assert "/api/auth/register" in schema["paths"]
        assert "/api/auth/login" in schema["paths"]
        assert "/api/cv/upload" in schema["paths"]
        assert "/api/roadmap/generate" in schema["paths"]
        assert "/api/chat/message" in schema["paths"]
