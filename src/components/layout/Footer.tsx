import { Github, Linkedin, Mail, Heart } from 'lucide-react';

/**
 * Footer component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Khalid
              </span>
            </h3>
            <p className="text-slate-400">
              Fullstack Developer & Data Scientist passionate about creating impactful solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="text-slate-400 hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get In Touch</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-slate-300" />
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-slate-300" />
              </a>
              <a
                href="mailto:your.email@example.com"
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-slate-300" />
              </a>
            </div>
            <p className="text-slate-400 mt-4">
              <a href="mailto:your.email@example.com" className="hover:text-white transition-colors">
                your.email@example.com
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 flex items-center justify-center gap-2">
            © {currentYear} Khalid. Built with{' '}
            <Heart className="w-4 h-4 text-red-500 fill-current" /> using Next.js & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
