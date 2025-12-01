// src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Content from '../components/Content';
import { useTranslation } from 'react-i18next';
import ShareSection from '../components/ShareSection';
import DonateButton from '../components/DonateButton';
import SubscribeButton from '../components/SubscribeButton'; // ✅ 1. Componente importado

import Layout from '../components/Layout'; 

declare global {
  interface Window {
    adsbygoogle: ({} | [])[];
  }
}

const NavigationCard = ({
  to,
  title,
  description,
  imgSrc,
}: {
  to: string;
  title: string;
  description: string;
  imgSrc: string;
}) => {
  return (
    <Link
      to={to}
      className="block bg-dark-card-bg border border-dark-border rounded-xl shadow-lg overflow-hidden hover:border-accent-gold transition-colors duration-300 h-[350px] flex flex-col"
    >
      <img src={imgSrc} alt={title} className="w-full h-64 object-cover" />
      <div className="p-4 flex-grow flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-accent-gold text-center">{title}</h3>
        <p className="text-sm text-gray-400 mt-1 text-center">{description}</p>
      </div>
    </Link>
  );
};

export default function HomePage() {
  const { t } = useTranslation();

  useEffect(() => {
    try {
      if (window.adsbygoogle && window.adsbygoogle.push) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Erro ao tentar carregar o anúncio Adsense:", e);
    }
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>{t('home.featuresTitle')}</title>
        <meta name="description" content={t('home.featuresDescription')} />
        <link rel="canonical" href="https://www.chronoodyssey.com.br/" />
      </Helmet>

      <main className="flex-grow">
        <section className="bg-dark-card-bg py-4 border-b-4 border-accent-gold">
          <div className="container mx-auto max-w-[1700px] h-[400px] rounded-lg overflow-hidden shadow-lg">
            <img
              className="w-full h-full object-cover object-top"
              alt={t('header.bannerAlt')}
              src="/banner1.webp"
            />
          </div>
        </section>

        <div className="container mx-auto max-w-[1900px] py-16 px-4">
          <div className="flex flex-col lg:flex-row items-start lg:justify-center lg:gap-8">
            <aside className="w-full lg:w-[450px] mt-8 lg:mt-0 lg:sticky lg:top-24">
              <div className="space-y-8">
                <NavigationCard
                  to="/map"
                  title={t('home.mapTitle')}
                  description={t('home.mapSubtitle')}
                  imgSrc="/MapBannerCover.webp"
                />
                <NavigationCard
                  to="/noticias"
                  title={t('home.newsTitle')}
                  description={t('home.newsSubtitle')}
                  imgSrc="NewsBannerCover.webp"
                />
              </div>
            </aside>

            <div className="flex-1 w-full lg:max-w-[900px] mt-8 lg:mt-0">
              <div className="bg-dark-card-bg border border-dark-border rounded-xl shadow-lg p-8 md:p-12">
                <h2 className="text-3xl font-semibold text-accent-gold mb-6 text-center">
                  {t('home.featuresTitle')}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed text-center">
                  {t('home.featuresDescription')}
                </p>
                <ul className="mt-8 space-y-4 text-gray-300 text-left max-w-3xl mx-auto">
                  {t('home.features', { returnObjects: true }).map(
                    (item: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-accent-gold mr-3 mt-1 text-xl">•</span>
                        <span className="text-lg leading-relaxed">{item}</span>
                      </li>
                    )
                  )}
                </ul>
                
                <div className="flex justify-center my-12">
                  <SubscribeButton />
                </div>
                
                {/* ================================================================== */}
                {/* == INÍCIO DO ANÚNCIO ADSENSE 1 == */}
                {/* ================================================================== */}
                <div className="my-10">
                    <ins className="adsbygoogle"
                         style={{ display: 'block', textAlign: 'center' }}
                         data-ad-layout="in-article"
                         data-ad-format="fluid"
                         data-ad-client="ca-pub-1133617565669510"
                         data-ad-slot="5281964806">
                    </ins>
                </div>
                {/* ================================================================== */}
                {/* == FIM DO ANÚNCIO ADSENSE 1 == */}
                {/* ================================================================== */}

                <div className="border-t border-dark-divider my-10"></div>
                
                <h2 className="text-3xl font-semibold text-accent-gold mb-4 text-center">
                  {t('home.gameTitle')}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-10 text-center">
                  {t('home.gameDescription')}
                </p>

                {/* ================================================================== */}
                {/* == INÍCIO DO ANÚNCIO ADSENSE 2 == */}
                {/* ================================================================== */}
                <div className="my-10">
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client="ca-pub-1133617565669510"
                         data-ad-slot="8184681500"
                         data-ad-format="auto"
                         data-full-width-responsive="true">
                    </ins>
                </div>
                {/* ================================================================== */}
                {/* == FIM DO ANÚNCIO ADSENSE 2 == */}
                {/* ================================================================== */}

                <div className="space-y-10">
                  <div><h3 className="text-2xl font-semibold text-text-white mb-3 text-center">{t('home.gameFeatures.world.title')}</h3><p className="text-lg text-gray-300 leading-relaxed text-center">{t('home.gameFeatures.world.desc')}</p></div>
                  <div><h3 className="text-2xl font-semibold text-text-white mb-3 text-center">{t('home.gameFeatures.chronotector.title')}</h3><p className="text-lg text-gray-300 leading-relaxed text-center">{t('home.gameFeatures.chronotector.desc')}</p></div>
                  <div><h3 className="text-2xl font-semibold text-text-white mb-3 text-center">{t('home.gameFeatures.dungeons.title')}</h3><p className="text-lg text-gray-300 leading-relaxed text-center">{t('home.gameFeatures.dungeons.desc')}</p></div>
                  <div><h3 className="text-2xl font-semibold text-text-white mb-3 text-center">{t('home.gameFeatures.crafting.title')}</h3><p className="text-lg text-gray-300 leading-relaxed text-center">{t('home.gameFeatures.crafting.desc')}</p></div>
                  <div><h3 className="text-2xl font-semibold text-text-white mb-3 text-center">{t('home.gameFeatures.customization.title')}</h3><p className="text-lg text-gray-300 leading-relaxed text-center">{t('home.gameFeatures.customization.desc')}</p></div>
                </div>
              </div>
            </div>

            <aside className="w-full lg:w-[450px] mt-8 lg:mt-0 lg:sticky lg:top-24">
              <div className="space-y-8">
                <NavigationCard
                  to="/sobre"
                  title={t('footerExtended.aboutTitle')}
                  description={t('footerExtended.aboutSubtitle')}
                  imgSrc="/AboutBannerCover.webp"
                />
                <NavigationCard
                  to="/contato"
                  title={t('footerExtended.contactTitle')}
                  description={t('footerExtended.contactSubtitle')}
                  imgSrc="ContactBannerCover.webp"
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <ShareSection />
      <Content />
      <div className="fixed right-1 bottom-10 z-[9999] flex flex-col gap-2">
        <DonateButton href="https://www.paypal.com/donate/?business=6KXEQHVYHLLQ8&no_recurring=0&item_name=Host%2FVPS&currency_code=BRL" icon="/paypal.svg" label="Donate with PayPal" />
        <DonateButton href="https://livepix.gg/serialhealer" icon="/pix.svg" label="Doe com Pix" />
      </div>
    </Layout>
  );
}
