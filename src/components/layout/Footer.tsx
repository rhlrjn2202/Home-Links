"use client";

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "About Us", to: "/about" },
    { name: "Careers", to: "/careers" },
    { name: "Terms & Conditions", to: "/terms" },
    { name: "Privacy Policy", to: "/privacy" },
    { name: "Sitemap", to: "/sitemap" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com" },
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Instagram, href: "https://instagram.com" },
    { icon: Linkedin, href: "https://linkedin.com" },
    { icon: Youtube, href: "https://youtube.com" },
  ];

  return (
    <footer className="bg-black text-white py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Navigation Links */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:text-base">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.to} className="hover:text-gray-300 transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="w-full border-t border-gray-700 mb-8 max-w-3xl" />

        {/* App Download Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* Placeholder for Google Play */}
          <div className="flex items-center justify-center h-12 w-40 bg-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer">
            Get it on Google Play
          </div>
          {/* Placeholder for App Store */}
          <div className="flex items-center justify-center h-12 w-40 bg-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer">
            Download on the App Store
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label={social.icon.displayName}
            >
              <social.icon className="h-5 w-5 text-white" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="w-full max-w-3xl mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            &copy; {currentYear} Home Links. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}