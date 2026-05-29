import { useState } from 'react';
import { createShortLink } from './api/links';
import Spinner from './components/Spinner';
import './App.css';

const DEFAULT_DLT_HEADER = 'ELVATK';
const DLT_HEADER_REGEX = /^[A-Z]{6}$/;

function App() {
  const [url, setUrl] = useState('');
  const [useDlt, setUseDlt] = useState(false);
  const [dltHeader, setDltHeader] = useState(DEFAULT_DLT_HEADER);
  const [shortUrl, setShortUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDltHeaderChange = (event) => {
    const lettersOnly = event.target.value
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 6);
    setDltHeader(lettersOnly);
  };

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

    if (useDlt && !DLT_HEADER_REGEX.test(dltHeader)) {
      setError('DLT header must be exactly 6 letters (A–Z only)');
      return;
    }

    setLoading(true);

    try {
      const data = await createShortLink({
        originalUrl: url.trim(),
        useDlt,
        dltHeader: useDlt ? dltHeader : undefined,
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate short link');
      }

      setShortUrl(data.shortUrl);
      setIsExisting(Boolean(data.existing));
      setStatusMessage(
        data.existing
          ? `Existing short URL found${data.dlt ? ' (DLT)' : ''}`
          : `New short URL created${data.dlt ? ' (DLT)' : ''}`
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

  const previewHeader = dltHeader.length === 6 ? dltHeader : 'XXXXXX';

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

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={useDlt}
              onChange={(event) => setUseDlt(event.target.checked)}
              disabled={loading}
            />
            <span>Use DLT header for SMS</span>
          </label>

          {useDlt && (
            <div className="dlt-header-field">
              <label htmlFor="dltHeader">DLT header (6 letters)</label>
              <input
                id="dltHeader"
                type="text"
                placeholder="ELVATK"
                value={dltHeader}
                onChange={handleDltHeaderChange}
                disabled={loading}
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="dlt-hint">
                Example:{' '}
                <code>https://links.elvatech.in/{previewHeader}/abc123</code>
              </p>
            </div>
          )}

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
