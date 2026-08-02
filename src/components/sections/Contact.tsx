'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Web3Forms access key
const ACCESS_KEY = '431a62b6-12d8-4d27-a40f-a862a881d837';

type FormData = {
  name: string;
  email: string;
  message: string;
};

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Contact form section — terminal style with Web3Forms integration
 */
export function Contact() {
  const [status, setStatus]           = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name:       data.name,
          email:      data.email,
          message:    data.message,
          subject:    `New Contact from hzcode: ${data.name}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 font-mono text-sm bg-terminal-bg border rounded text-terminal-text-primary placeholder-terminal-text-muted
    focus:outline-none focus:border-terminal-primary transition-colors duration-150
    ${hasError ? 'border-terminal-accent' : 'border-terminal-border'}`;

  return (
    <section className="py-20" id="contact">
      <div className="max-w-2xl mx-auto px-6">

        <p className="font-mono text-terminal-primary text-sm mb-2">
          $ ping harinzu47@gmail.com
        </p>
        <h2 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-4">
          Get In Touch
        </h2>
        <p className="text-terminal-text-secondary mb-10">
          Have a project in mind or want to collaborate? Drop a message below.
        </p>

        {/* Form card */}
        <div className="border border-terminal-border rounded bg-terminal-surface p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-mono text-xs text-terminal-text-muted mb-2 uppercase tracking-wider">
                // name <span className="text-terminal-accent">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="your name"
                className={inputClass(!!errors.name)}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-terminal-accent font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-mono text-xs text-terminal-text-muted mb-2 uppercase tracking-wider">
                // email <span className="text-terminal-accent">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className={inputClass(!!errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-terminal-accent font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block font-mono text-xs text-terminal-text-muted mb-2 uppercase tracking-wider">
                // message <span className="text-terminal-accent">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me about your project or idea..."
                className={`${inputClass(!!errors.message)} resize-none`}
                {...register('message', {
                  required: 'Message is required',
                  minLength: { value: 10, message: 'Message must be at least 10 characters' },
                })}
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-terminal-accent font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Error */}
            {status === 'error' && (
              <div className="p-4 border border-terminal-accent/30 bg-terminal-accent/5 rounded font-mono text-sm text-terminal-accent flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="p-4 border border-terminal-primary/30 bg-terminal-primary/5 rounded font-mono text-sm text-terminal-primary flex items-start gap-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Message sent. I&apos;ll get back to you soon.</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full py-3 px-6 rounded font-mono text-sm flex items-center justify-center gap-2 border transition-colors duration-150 ${
                status === 'success'
                  ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/10 cursor-default'
                  : 'border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> sending...</>
              ) : status === 'success' ? (
                <><CheckCircle className="w-4 h-4" /> sent</>
              ) : (
                <><Send className="w-4 h-4" /> [./send-message]</>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
