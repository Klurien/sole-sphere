import React from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Instagram,
    Twitter,
    Facebook,
    Youtube,
    Music,
    Search,
    Shield,
    CheckCircle
} from 'lucide-react';
import { BRAND } from '../../brandConfig';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-v3">
            <div className="container footer-v3-top">
                {/* Brand */}
                <div className="f-v3-col brand-col">
                    <Link to="/" className="v3-logo">
                        <div className="v3-logo-symbol"></div>
                        <span className="v3-logo-text">SOLE <span className="highlight">SPHERE</span></span>
                    </Link>
                    <p className="f-v3-description">
                        Premium authentic sneakers for the modern enthusiast. We bridge the gap between street culture and high-end luxury, delivering only the most sought-after silhouettes to your doorstep.
                    </p>
                    <div className="f-v3-social">
                        <a href={BRAND.social.facebook} className="social-link-v3 fb"><Facebook size={18} /></a>
                        <a href={BRAND.social.twitter} className="social-link-v3 tw"><Twitter size={18} /></a>
                        <a href={BRAND.social.instagram} className="social-link-v3 ig"><Instagram size={18} /></a>
                        <a href={BRAND.social.tiktok || "#"} className="social-link-v3 tk"><Music size={18} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="f-v3-col">
                    <h4 className="f-v3-heading">Shop</h4>
                    <ul className="f-v3-links">
                        <li><Link to="/products">New Arrivals</Link></li>
                        <li><Link to="/products?category=Limited Edition">Limited Edition</Link></li>
                        <li><Link to="/products?category=Basketball">Basketball Series</Link></li>
                        <li><Link to="/products?category=Running">Performance Running</Link></li>
                        <li><Link to="/products?category=Streetwear">Streetwear Essentials</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div className="f-v3-col">
                    <h4 className="f-v3-heading">Sole Sphere</h4>
                    <ul className="f-v3-links">
                        <li><Link to="/">About Us</Link></li>
                        <li><Link to="/contact">Contact Support</Link></li>
                        <li><Link to="/">Authenticity Guarantee</Link></li>
                        <li><Link to="/">Shipping Policy</Link></li>
                        <li><Link to="/">Returns & Exchanges</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="f-v3-col contact-col">
                    <h4 className="f-v3-heading">Contact Us</h4>
                    <div className="f-v3-contact">
                        <div className="contact-item-v3">
                            <Phone size={18} className="icon-orange" />
                            <div className="contact-text">
                                <span>Phone & WhatsApp</span>
                                <p>{BRAND.phone}</p>
                            </div>
                        </div>
                        <div className="contact-item-v3">
                            <Mail size={18} className="icon-orange" />
                            <div className="contact-text">
                                <span>Email Address</span>
                                <p>{BRAND.email}</p>
                            </div>
                        </div>
                        <div className="contact-item-v3">
                            <MapPin size={18} className="icon-orange" />
                            <div className="contact-text">
                                <span>The HQ</span>
                                <p>{BRAND.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-v3-bottom">
                <div className="container footer-v3-inner">
                    <p>© {new Date().getFullYear()} Sole Sphere. All rights reserved.</p>
                    <div className="f-v3-legal">
                        <Link to="#">Privacy Policy</Link>
                        <span className="f-v3-dot"></span>
                        <Link to="#">Terms of Service</Link>
                        <span className="f-v3-dot"></span>
                        <Link to="#">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

