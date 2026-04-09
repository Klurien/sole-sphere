import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock, Send, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { BRAND } from '../brandConfig';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-page">
            <Helmet>
                <title>Contact Us | Sole Sphere</title>
                <meta name="description" content="Get in touch with the Sole Sphere team. Authentic sneakers, exclusive drops, and worldwide shipping support." />
                <link rel="canonical" href="https://solesphere.com/contact" />
            </Helmet>

            <section className="contact-hero">
                <div className="container">
                    <span className="v3-sub">Get in Touch</span>
                    <h1>WE ARE AT YOUR <span className="accent">SERVICE</span></h1>
                </div>
            </section>

            <section className="contact-grid-section container">
                <div className="contact-info-grid">
                    <div className="contact-info-card glass-panel">
                        <div className="info-icon"><MapPin /></div>
                        <h3>Headquarters</h3>
                        <p>{BRAND.address}</p>
                    </div>
                    <div className="contact-info-card glass-panel">
                        <div className="info-icon"><Phone /></div>
                        <h3>Phone & WhatsApp</h3>
                        <p>{BRAND.phone}</p>
                    </div>
                    <div className="contact-info-card glass-panel">
                        <div className="info-icon"><Mail /></div>
                        <h3>Email Inquiry</h3>
                        <p>{BRAND.email}</p>
                    </div>
                    <div className="contact-info-card glass-panel">
                        <div className="info-icon"><Clock /></div>
                        <h3>Opening Hours</h3>
                        <p>Mon - Sat: 8:00 AM - 6:30 PM<br />Sun: By Appointment</p>
                    </div>
                </div>

                <div className="contact-main-layout">
                    <div className="contact-form-wrap glass-panel">
                        <h2>Send an <span className="accent">Inquiry</span></h2>
                        <form className="contact-form">
                            <div className="form-row">
                                <div className="form-group-v3">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" required />
                                </div>
                                <div className="form-group-v3">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+254..." required />
                                </div>
                            </div>
                            <div className="form-group-v3">
                                <label>Subject</label>
                                <select className="v3-select">
                                    <option>General Inquiry</option>
                                    <option>Custom Sourcing Request</option>
                                    <option>Authenticity Check</option>
                                    <option>Shipping & Delivery</option>
                                </select>
                            </div>
                            <div className="form-group-v3">
                                <label>Your Message</label>
                                <textarea rows="5" placeholder="Tell us about the pair you're looking for..."></textarea>
                            </div>
                            <button type="submit" className="primary-btn contact-submit">
                                Send Message <Send size={16} />
                            </button>
                        </form>
                    </div>

                    <div className="contact-map-wrap glass-panel">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.932408381!2d36.9634731!3d-1.1472851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3f886f6d0f88%3A0x61560438815769!2sBazaar%20Motors!5e0!3m2!1sen!2ske!4v1711200000000!5m2!1sen!2ske" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Sole Sphere Location"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
