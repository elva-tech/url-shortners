import { useState } from 'react';
import { createShortLink } from './api/links';
import Spinner from './components/Spinner';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setShortUrl('');
    setStatusMessage('');
    setCopied(false);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      const data = await createShortLink(url.trim());

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate short link');
      }

      setShortUrl(data.shortUrl);
      setIsExisting(Boolean(data.existing));
      setStatusMessage(
        data.existing
          ? 'Existing short URL found'
          : 'New short URL created'
      );
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Unable to copy to clipboard');
    }
  };

  return (
    <div className="page">
      <main className="card">
        <header className="header">
          <img
            src="/ELVA_LOGO.png"
            alt="ELVA logo"
            className="logo"
            width={72}
            height={72}
          />
          <h1>ELVA Links</h1>
          <p className="subtitle">
            Smart URL Shortener for Notifications &amp; Delivery Tracking
          </p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="url">Long URL</label>
          <input
            id="url"
            type="text"
            placeholder="https://maps.google.com/... or tracking URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={loading}
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              'Generate Short Link'
            )}
          </button>
        </form>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {statusMessage && (
          <div className="result" role="status">
            <p className={`message ${isExisting ? 'info' : 'success'}`}>
              {statusMessage}
            </p>
            <div className="short-url-box">
              <p className="short-url-text">{shortUrl}</p>
              <div className="action-row">
                <button type="button" className="secondary-btn" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn open-btn"
                >
                  Open
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by ELVA Tech</p>
      </footer>
    </div>
  );
}

export default App;
