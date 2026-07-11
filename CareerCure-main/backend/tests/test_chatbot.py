"""
End-to-end tests for the AI chatbot endpoint.
Groq LLM calls are mocked.
"""
from unittest.mock import patch, MagicMock


class TestChatbot:
    def test_chat_requires_auth(self, client):
        res = client.post("/api/chat/message", json={"message": "Hello"})
        assert res.status_code == 401

    @patch("app.chatbot.chat_service.Groq")
    @patch("app.chatbot.chat_service.embed_text")
    @patch("app.chatbot.chat_service.search_faqs")
    def test_chat_success(self, mock_faqs, mock_embed, mock_groq, client, auth_headers):
        # Mock embeddings and FAQ search
        mock_embed.return_value = [0.1] * 384
        mock_faqs.return_value = ["Focus on building projects to get your first internship."]

        # Mock Groq response
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Great question! Focus on building real projects."
        mock_client.chat.completions.create.return_value = mock_response

        res = client.post("/api/chat/message",
                          json={"message": "How do I get my first internship?", "history": []},
                          headers=auth_headers)
        assert res.status_code == 200
        assert "reply" in res.json()
        assert len(res.json()["reply"]) > 0

    def test_chat_empty_message(self, client, auth_headers):
        res = client.post("/api/chat/message",
                          json={"message": "", "history": []},
                          headers=auth_headers)
        assert res.status_code == 400
        assert "empty" in res.json()["detail"].lower()

    def test_chat_whitespace_message(self, client, auth_headers):
        res = client.post("/api/chat/message",
                          json={"message": "   ", "history": []},
                          headers=auth_headers)
        assert res.status_code == 400

    @patch("app.chatbot.chat_service.Groq")
    @patch("app.chatbot.chat_service.embed_text")
    @patch("app.chatbot.chat_service.search_faqs")
    def test_chat_with_history(self, mock_faqs, mock_embed, mock_groq, client, auth_headers):
        mock_embed.return_value = [0.1] * 384
        mock_faqs.return_value = []

        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Python is great for data science!"
        mock_client.chat.completions.create.return_value = mock_response

        history = [
            {"role": "user", "content": "What should I learn?"},
            {"role": "assistant", "content": "Learn Python first."},
        ]
        res = client.post("/api/chat/message",
                          json={"message": "Tell me more about Python", "history": history},
                          headers=auth_headers)
        assert res.status_code == 200
        assert "reply" in res.json()

    @patch("app.chatbot.chat_service.Groq")
    @patch("app.chatbot.chat_service.embed_text")
    @patch("app.chatbot.chat_service.search_faqs")
    def test_chat_reply_is_string(self, mock_faqs, mock_embed, mock_groq, client, auth_headers):
        mock_embed.return_value = [0.1] * 384
        mock_faqs.return_value = []

        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Here is my advice."
        mock_client.chat.completions.create.return_value = mock_response

        res = client.post("/api/chat/message",
                          json={"message": "Give me career advice", "history": []},
                          headers=auth_headers)
        assert isinstance(res.json()["reply"], str)
