import { MapPin, Phone, Mail, Globe, Share2, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { publicAssetUrl } from '../lib/publicUrl';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container grid footer-grid">
          <div className="footer-col">
            <Link className="footer-brand" href="/" aria-label="Fassia Secret">
              <img className="footer-logo" src={publicAssetUrl('logo.png')} alt="Fassia Secret" />
            </Link>
            <p className="text-muted text-sm mb-lg">
              Votre parapharmacie en ligne de confiance. Produits santé & beauté livrés partout au Maroc.
            </p>
            <div className="social-links flex gap-md">
              <a href="https://www.instagram.com/fassia_secret?igsh=ajZ6bm9kNnUwbmRw" className="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://wa.me/212774656745" className="social-icon" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="mb-md">Liens Rapides</h4>
            <ul className="footer-links">
              <li><a href="#">Conditions de livraison</a></li>
              <li><a href="#">Mentions légales</a></li>
              <li><a href="#">Conditions générales</a></li>
              <li><a href="#">Suivi de commande</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="mb-md">Mon Compte</h4>
            <ul className="footer-links">
              <li><a href="#">Informations personnelles</a></li>
              <li><a href="#">Historique des commandes</a></li>
              <li><a href="#">Mes adresses</a></li>
              <li><a href="#">Liste de souhaits</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="mb-md">Contactez-nous</h4>
            <div className="footer-map" aria-label="Carte - localisation">
              <iframe
                title="Localisation Fassia Secret"
                src="https://www.google.com/maps?q=2XJV%2B3W4%D8%8C%20Rue%20Matrane%20Khalil%20Matrane%2C%20Fes%2030050%2C%20Morocco&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <ul className="contact-list text-sm text-muted">
              <li className="flex gap-sm items-center">
                <MapPin size={14} className="text-primary" />
                <a
                  className="contact-link"
                  href="https://maps.app.goo.gl/R5STHD4uZzu36Lfn8"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Voir la localisation sur Google Maps"
                >
                  Fès, Maroc <ExternalLink size={14} />
                </a>
              </li>
              <li className="flex gap-sm items-center">
                <Phone size={14} className="text-primary" />
                <a className="contact-link" href="https://wa.me/212774656745" target="_blank" rel="noopener noreferrer">+212 774-656745</a>
              </li>
              <li className="flex gap-sm items-center">
                <Mail size={14} className="text-primary" />
                <a className="contact-link" href="mailto:fassiasecret@gmail.com">fassiasecret@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container flex justify-between items-center text-xs text-muted">
          <p>© 2026 Fassia Secret. Tous droits réservés.</p>
          <div className="payment-methods" aria-label="Paiement sécurisé">
            <ShieldCheck size={16} />
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
