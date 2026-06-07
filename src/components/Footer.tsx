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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
              </a>
              <a href="https://wa.me/212774656745" className="social-icon" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
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
        <div className="container flex justify-between items-center text-xs text-muted" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <p>© 2026 Fassia Secret. Tous droits réservés.</p>
          <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
            <Link href="/conditions-generales" className="footer-link">Conditions générales</Link>
            <div className="payment-methods" aria-label="Paiement à la livraison">
              <ShieldCheck size={16} />
              <span>Paiement à la livraison</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
