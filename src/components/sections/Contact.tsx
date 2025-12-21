'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Paste your Web3Forms Access Key here
const ACCESS_KEY = '431a62b6-12d8-4d27-a40f-a862a881d837';

type FormData = {
  name: string;
  email: string;
  message: string;
};

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Contact form section with Web3Forms integration
 */
export function Contact() {
  const [status, setStatus] = useState<FormStatus>('idle');
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
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name: data.name,
          email: data.email,
          message: data.message,
          subject: `New Contact from Portfolio: ${data.name}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        reset();
        // Reset to idle after 5 seconds
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

  return (
    <section className="py-20" id="contact">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Get In Touch
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Have a project in mind or want to collaborate? Feel free to reach out!
        </p>

        {/* Contact Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your name"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                  transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-slate-700'
                  }`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                  transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me about your project or idea..."
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                  transition-all duration-200 resize-none ${
                    errors.message ? 'border-red-500' : 'border-slate-700'
                  }`}
                {...register('message', {
                  required: 'Message is required',
                  minLength: { value: 10, message: 'Message must be at least 10 characters' },
                })}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">
                  Thank you! Your message has been sent successfully. I&apos;ll get back to you soon.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 
                flex items-center justify-center gap-2 ${
                  status === 'loading'
                    ? 'bg-blue-600/50 cursor-not-allowed'
                    : status === 'success'
                    ? 'bg-green-600 cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
