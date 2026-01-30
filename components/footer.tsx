<<<<<<< HEAD
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const routes = {
  'about-strapre': '/about',
  'safety': '/safety',
  'ip-violation': '/ip-violation',
  'terms-conditions': '/terms',
  'privacy-policy': '/privacy-policy',
  'intellectual-property': '/intellectual-property',
  'support-email': 'mailto:support@strapre.com',
  'tiktok': 'https://www.tiktok.com/@mastakonet2015?_t=ZM-8xwzxzfLkGO&_r=1',
  'instagram': 'https://www.instagram.com/strapre_?igsh=azhqeDEzMHkyZ2N5&utm_source=qr',
  'twitter': 'https://x.com/mastakonnect?s=21&t=cKxBkMcle1uLVPlicrRMrA',
} as const;

type Section = keyof typeof routes;

const Footer = () => {
  const router = useRouter();

  const handleNavigation = (section: Section) => {
    const route = routes[section];
    if (route.startsWith('http') || route.startsWith('mailto:')) {
      window.open(route, '_blank');
    } else {
      router.push(route);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-6">About us</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('about-strapre')} className="hover:text-gray-200 text-left">About strapre</button></li>
              <li><button onClick={() => handleNavigation('safety')} className="hover:text-gray-200 text-left">Safety Tips</button></li>
              <li><button onClick={() => handleNavigation('terms-conditions')} className="hover:text-gray-200 text-left">Terms and Conditions</button></li>
              <li><button onClick={() => handleNavigation('ip-violation')} className="hover:text-gray-200 text-left">IP Violation and Copyright</button></li>
              <li><button onClick={() => handleNavigation('privacy-policy')} className="hover:text-gray-200 text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleNavigation('intellectual-property')} className="hover:text-gray-200 text-left">Intellectual Property</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('support-email')} className="hover:text-gray-200 text-left">Email: support@strapre.com</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Our resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleNavigation('tiktok')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M41.6 15.1c-3.5 0-6.5-1.1-8.9-3V30c0 8.4-6.9 15.3-15.3 15.3S2 38.4 2 30s6.9-15.3 15.3-15.3c1.1 0 2.2.1 3.3.4v7.2c-1-.3-2.1-.5-3.3-.5-4.5 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1V2h7.1c.4 2.6 1.8 5 3.8 6.7 2 1.7 4.5 2.6 7.2 2.6v7.8z" />
                  </svg>
                  <span>Tiktok</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('instagram')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('twitter')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">About us</h3>
              <ul className="space-y-2 text-[12px] md:text-sm">
                <li><button onClick={() => handleNavigation('about-strapre')} className="hover:text-gray-200 text-left">About strapre</button></li>
                <li><button onClick={() => handleNavigation('safety')} className="hover:text-gray-200 text-left">Safety Tips</button></li>
                <li><button onClick={() => handleNavigation('terms-conditions')} className="hover:text-gray-200 text-left">Terms and Conditions</button></li>
                <li><button onClick={() => handleNavigation('ip-violation')} className="hover:text-gray-200 text-left">IP Violation and Copyright</button></li>
                <li><button onClick={() => handleNavigation('privacy-policy')} className="hover:text-gray-200 text-left">Privacy Policy</button></li>
                <li><button onClick={() => handleNavigation('intellectual-property')} className="hover:text-gray-200 text-left">Intellectual Property</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-[12px] md:text-sm mb-6">
                <li><button onClick={() => handleNavigation('support-email')} className="hover:text-gray-200 text-left">support@strapre.com</button></li>
              </ul>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">Follow us</h3>
              <div className="flex space-x-4">
                <button onClick={() => handleNavigation('tiktok')} className="hover:text-gray-200">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M41.6 15.1c-3.5 0-6.5-1.1-8.9-3V30c0 8.4-6.9 15.3-15.3 15.3S2 38.4 2 30s6.9-15.3 15.3-15.3c1.1 0 2.2.1 3.3.4v7.2c-1-.3-2.1-.5-3.3-.5-4.5 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1V2h7.1c.4 2.6 1.8 5 3.8 6.7 2 1.7 4.5 2.6 7.2 2.6v7.8z" />
                  </svg>
                </button>
                <button onClick={() => handleNavigation('instagram')} className="hover:text-gray-200">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                <button onClick={() => handleNavigation('twitter')} className="hover:text-gray-200">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex justify-center">
            <p className="text-sm text-white/80 text-center">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
=======
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const routes = {
  'about-strapre': '/about',
  'safety': '/safety',
  'ip-violation': '/ip-violation',
  'terms-conditions': '/terms',
  'privacy-policy': '/privacy-policy',
  'intellectual-property': '/intellectual-property',
  'support-email': 'mailto:support@strapre.com',
  'tiktok': 'https://www.tiktok.com/@mastakonet2015?_t=ZM-8xwzxzfLkGO&_r=1',
  'instagram': 'https://www.instagram.com/strapre_?igsh=azhqeDEzMHkyZ2N5&utm_source=qr',
  'twitter': 'https://x.com/mastakonnect?s=21&t=cKxBkMcle1uLVPlicrRMrA',
} as const;

type Section = keyof typeof routes;

const Footer = () => {
  const router = useRouter();

  const handleNavigation = (section: Section) => {
    const route = routes[section];
    if (route.startsWith('http') || route.startsWith('mailto:')) {
      window.open(route, '_blank');
    } else {
      router.push(route);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-6">About us</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('about-strapre')} className="hover:text-gray-200 text-left">About strapre</button></li>
              <li><button onClick={() => handleNavigation('safety')} className="hover:text-gray-200 text-left">Safety Tips</button></li>
              <li><button onClick={() => handleNavigation('terms-conditions')} className="hover:text-gray-200 text-left">Terms and Conditions</button></li>
              <li><button onClick={() => handleNavigation('ip-violation')} className="hover:text-gray-200 text-left">IP Violation and Copyright</button></li>
              <li><button onClick={() => handleNavigation('privacy-policy')} className="hover:text-gray-200 text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleNavigation('intellectual-property')} className="hover:text-gray-200 text-left">Intellectual Property</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('support-email')} className="hover:text-gray-200 text-left">Email: support@strapre.com</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Our resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleNavigation('tiktok')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M41.6 15.1c-3.5 0-6.5-1.1-8.9-3V30c0 8.4-6.9 15.3-15.3 15.3S2 38.4 2 30s6.9-15.3 15.3-15.3c1.1 0 2.2.1 3.3.4v7.2c-1-.3-2.1-.5-3.3-.5-4.5 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1V2h7.1c.4 2.6 1.8 5 3.8 6.7 2 1.7 4.5 2.6 7.2 2.6v7.8z" />
                  </svg>
                  <span>Tiktok</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('instagram')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('twitter')} className="hover:text-gray-200 text-left flex items-center space-x-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">About us</h3>
              <ul className="space-y-2 text-[12px] md:text-sm">
                <li><button onClick={() => handleNavigation('about-strapre')} className="hover:text-gray-200 text-left">About strapre</button></li>
                <li><button onClick={() => handleNavigation('safety')} className="hover:text-gray-200 text-left">Safety Tips</button></li>
                <li><button onClick={() => handleNavigation('terms-conditions')} className="hover:text-gray-200 text-left">Terms and Conditions</button></li>
                <li><button onClick={() => handleNavigation('ip-violation')} className="hover:text-gray-200 text-left">IP Violation and Copyright</button></li>
                <li><button onClick={() => handleNavigation('privacy-policy')} className="hover:text-gray-200 text-left">Privacy Policy</button></li>
                <li><button onClick={() => handleNavigation('intellectual-property')} className="hover:text-gray-200 text-left">Intellectual Property</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-[12px] md:text-sm mb-6">
                <li><button onClick={() => handleNavigation('support-email')} className="hover:text-gray-200 text-left">support@strapre.com</button></li>
              </ul>
              <h3 className="font-bold text-[16px] md:text-lg mb-4">Follow us</h3>
              <div className="flex space-x-4">
                <button onClick={() => handleNavigation('tiktok')} className="hover:text-gray-200">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M41.6 15.1c-3.5 0-6.5-1.1-8.9-3V30c0 8.4-6.9 15.3-15.3 15.3S2 38.4 2 30s6.9-15.3 15.3-15.3c1.1 0 2.2.1 3.3.4v7.2c-1-.3-2.1-.5-3.3-.5-4.5 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1V2h7.1c.4 2.6 1.8 5 3.8 6.7 2 1.7 4.5 2.6 7.2 2.6v7.8z" />
                  </svg>
                </button>
                <button onClick={() => handleNavigation('instagram')} className="hover:text-gray-200">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                <button onClick={() => handleNavigation('twitter')} className="hover:text-gray-200">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex justify-center">
            <p className="text-sm text-white/80 text-center">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
>>>>>>> 533c22393c774a56ed1968293eb2ddaf3c4ec728
