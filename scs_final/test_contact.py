"""Self-check for /api/submit-contact. Run: python test_contact.py"""
import os
from unittest import mock

from app import app, _request_log

ENV = {"SMTP_USER": "office@example.com", "SMTP_PASSWORD": "app-password"}
VALID = {"name": "Ravi\r\nBcc: evil@x.com", "email": "ravi@client.in", "message": "Need ESIC registration"}


def post(body):
    _request_log.clear()  # keep the rate limiter out of the way
    return app.test_client().post("/api/submit-contact", json=body)


with mock.patch.dict(os.environ, ENV), mock.patch("smtplib.SMTP_SSL") as smtp:
    r = post(VALID)
    assert r.status_code == 200, r.get_json()
    sent = smtp.return_value.__enter__.return_value.send_message.call_args[0][0]
    assert sent["To"] == "office@example.com"
    assert sent["Reply-To"] == "ravi@client.in"
    assert "\n" not in sent["Subject"] and "Bcc" not in sent.keys()

    assert post({**VALID, "email": "not-an-email"}).status_code == 400

    smtp.side_effect = OSError("smtp down")
    assert post(VALID).status_code == 500  # never claim success when the send failed

with mock.patch.dict(os.environ, {"SMTP_USER": "", "SMTP_PASSWORD": ""}):
    assert post(VALID).status_code == 500  # unconfigured -> error, not silent success

print("contact form: all checks passed")
