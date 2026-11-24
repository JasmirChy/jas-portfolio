import { useState } from 'react';
import { sendContactMessage } from '../api/portfolioApi';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      await sendContactMessage(form);
      setStatus({
        type: 'success',
        text: 'Message sent! I will get back to you soon.',
      });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        text: 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="name"
          required
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <input
        type="text"
        name="subject"
        placeholder="Subject (Optional)"
        value={form.subject}
        onChange={handleChange}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
      />

      <textarea
        name="message"
        rows="4"
        required
        placeholder="Tell me about your project or idea..."
        value={form.message}
        onChange={handleChange}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
      />

      {status.text && (
        <p
          className={`rounded-lg px-4 py-2.5 text-sm ${
            status.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {status.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  );
}