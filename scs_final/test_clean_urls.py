from app import app


def test():
    c = app.test_client()
    assert c.get('/payroll').status_code == 200        # clean URL -> payroll.html
    assert c.get('/swipe-analytics').status_code == 200  # clean URL -> swipe-analytics.html
    assert c.get('/').status_code == 200                 # index
    assert c.get('/styles.css').status_code == 200       # normal asset
    assert c.get('/.env').status_code == 404             # dotfile blocked
    assert c.get('/app.py').status_code == 404           # source blocked
    assert c.get('/nope').status_code == 404             # missing clean URL, no .html
    print("ok")


if __name__ == '__main__':
    test()
