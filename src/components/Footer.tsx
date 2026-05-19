import { MapPin, Phone, Mail, Globe, Share2, ShieldCheck } from 'lucide-react';
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
              <a href="#" className="social-icon" aria-label="Website">
                <Globe size={18} />
              </a>
              <a href="#" className="social-icon" aria-label="Share">
                <Share2 size={18} />
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
            <ul className="contact-list text-sm text-muted">
              <li className="flex gap-sm items-center">
                <MapPin size={14} className="text-primary" />
                <span>Casablanca, Maroc</span>
              </li>
              <li className="flex gap-sm items-center">
                <Phone size={14} className="text-primary" />
                <span>+212 600 000 000</span>
              </li>
              <li className="flex gap-sm items-center">
                <Mail size={14} className="text-primary" />
                <span>contact@fassiasecret.com</span>
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
