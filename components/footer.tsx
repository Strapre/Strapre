'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const routes = {
  'create-account': '/register',
  'bid': '/bid',
  'gift-cards': '/gift-cards',
  'become-seller': '/register',
  'auction': '/auction',
  'store': '/store',
  'local': '/logistics/local',
  'cross-border': '/logistics/cross-border',
  'contact': '/contact',
  'email': '/contact/email',
  'privacy-policy': '/privacy-policy',
  'terms-conditions': '/terms',
  'facebook': 'https://facebook.com/strapre',
  'linkedin': 'https://linkedin.com/company/strapre',
  'twitter': 'https://twitter.com/strapre',
} as const;

type Section = keyof typeof routes;

const Footer = () => {
  const router = useRouter();

  const handleNavigation = (section: Section) => {
    const route = routes[section];
    if (route.startsWith('http')) {
      window.open(route, '_blank');
    } else {
      router.push(route);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#CB0207] to-[#A50206] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-6">Buy</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('create-account')} className="hover:text-gray-200 text-left">Create account</button></li>
              <li><button onClick={() => handleNavigation('bid')} className="hover:text-gray-200 text-left">Bid</button></li>
              <li><button onClick={() => handleNavigation('gift-cards')} className="hover:text-gray-200 text-left">Gift cards</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Sell</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('become-seller')} className="hover:text-gray-200 text-left">Become a seller</button></li>
              <li><button onClick={() => handleNavigation('auction')} className="hover:text-gray-200 text-left">Auction</button></li>
              <li><button onClick={() => handleNavigation('store')} className="hover:text-gray-200 text-left">Store</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Logistics</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('local')} className="hover:text-gray-200 text-left">Local</button></li>
              <li><button onClick={() => handleNavigation('cross-border')} className="hover:text-gray-200 text-left">Cross border</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Customer Support</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleNavigation('contact')} className="hover:text-gray-200 text-left">Contact us</button></li>
              <li><button onClick={() => handleNavigation('email')} className="hover:text-gray-200 text-left">Email</button></li>
            </ul>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden grid grid-cols-2 gap-6 mt-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNavigation('create-account')} className="hover:text-gray-200 text-left">Create account</button></li>
              <li><button onClick={() => handleNavigation('become-seller')} className="hover:text-gray-200 text-left">Become a seller</button></li>
              <li><button onClick={() => handleNavigation('auction')} className="hover:text-gray-200 text-left">Auction</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNavigation('contact')} className="hover:text-gray-200 text-left">Contact us</button></li>
              <li><button onClick={() => handleNavigation('local')} className="hover:text-gray-200 text-left">Local delivery</button></li>
              <li><button onClick={() => handleNavigation('cross-border')} className="hover:text-gray-200 text-left">Cross border</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          {/* Social Media */}
          <div className="flex justify-center md:justify-start space-x-4 mb-6">
            <button onClick={() => handleNavigation('facebook')}><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><span className="text-white font-bold">f</span></div></button>
            <button onClick={() => handleNavigation('linkedin')}><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><span className="text-white font-bold">in</span></div></button>
            <button onClick={() => handleNavigation('twitter')}><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><span className="text-white font-bold">@</span></div></button>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0 text-sm">
              <button onClick={() => handleNavigation('privacy-policy')} className="hover:text-gray-200 text-center md:text-left">Privacy Policy</button>
              <button onClick={() => handleNavigation('terms-conditions')} className="hover:text-gray-200 text-center md:text-left">Terms & Conditions</button>
            </div>
            <p className="text-sm text-white/80 text-center md:text-right">© 2025 Strapre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
