import React, { useState, useEffect } from 'react';

// Sabit Kampanyalar (Farklı Sektörlerden 5 Billboard Görevi)
const CAMPAIGNS = [
  {
    id: 1,
    title: 'Koton - Yeni Sezon Koleksiyonu',
    category: 'Moda & Giyim',
    brand_name: 'Koton',
    reward_points: 60,
    banner: '🛍️'
  },
  {
    id: 2,
    title: 'Kurukahveci Mehmet Efendi - Geleneksel Lezzet',
    category: 'Gıda & İçecek',
    brand_name: 'Kurukahveci Mehmet Efendi',
    reward_points: 50,
    banner: '☕'
  },
  {
    id: 3,
    title: 'Getir - Dakikalar İçinde Kapında',
    category: 'Hızlı Teslimat',
    brand_name: 'Getir',
    reward_points: 40,
    banner: '🛵'
  },
  {
    id: 4,
    title: 'Trendyol - Büyük İndirim Günleri',
    category: 'E-Ticaret',
    brand_name: 'Trendyol',
    reward_points: 50,
    banner: '📦'
  },
  {
    id: 5,
    title: 'Apple iPhone - Geleceğin Gücü',
    category: 'Teknoloji',
    brand_name: 'Apple',
    reward_points: 75,
    banner: '📱'
  }
];

const AVATARS = ['🦊', '🐼', '🐯', '🐨', '🦁'];

export default function App() {
  // Kullanıcı ve Profil Durumları
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ad_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Menü ve Navigasyon
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'rewards'

  // Kampanya ve Anket Durumları
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Altın Para Animasyonu State'leri
  const [showCoins, setShowCoins] = useState(false);
  const [coinBounce, setCoinBounce] = useState(false);

  // 5 Çoktan Seçmeli + 1 Açık Uçlu Soru State'leri
  const [q1, setQ1] = useState('Çok Dikkat Çekici');
  const [q2, setQ2] = useState('Oldukça Açık ve Anlaşılır');
  const [q3, setQ3] = useState('Tasarım Çok Başarılı');
  const [q4, setQ4] = useState('Evet, Kesinlikle Artırdı');
  const [q5, setQ5] = useState('Kusursuz / Çok Net');
  const [openFeedback, setOpenFeedback] = useState('');

  // Kullanıcı durumunu localStorage'a kaydet
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ad_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Giriş / Kayıt İşlemi
  const handleAuth = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setStatusMessage('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    const userData = {
      name: authName.trim() || authEmail.split('@')[0],
      email: authEmail.trim(),
      avatar: '🦊',
      points: 100 // İlk girişte hoş geldin puanı
    };
    setCurrentUser(userData);
   setStatusMessage("Hos geldiniz!");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ad_user');
    setIsDrawerOpen(false);
    setSelectedCampaign(null);
    setShowSurvey(false);
    setStatusMessage('Oturum kapatıldı.');
  };

  const changeAvatar = (av) => {
    if (!currentUser) return;
    setCurrentUser(prev => ({ ...prev, avatar: av }));
  };

  // Kamera Çekimi Demo Doğrulama
  const handleImageCapture = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    setStatusMessage('Görsel analiz ediliyor...');

    setTimeout(() => {
      setLoading(false);
      setShowSurvey(true);
      setStatusMessage('Reklam panosu doğrulandı! Lütfen 6 soruluk etki anketini yanıtlayın.');
    }, 1000);
  };

  // Anketi Gönderme & Altın Para Efekti
  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const earned = selectedCampaign ? selectedCampaign.reward_points : 50;

    // 1. Para animasyonunu başlat
    setShowCoins(true);

    // 2. Paralar cüzdana vardığında rozeti zıplat ve puanı artır
    setTimeout(() => {
      setCoinBounce(true);
      setCurrentUser(prev => ({
        ...prev,
        points: (prev?.points || 0) + earned
      }));
      setTimeout(() => setCoinBounce(false), 500);
    }, 850);

    // 3. Efekti ve anketi temizle
    setTimeout(() => {
      setShowCoins(false);
      setShowSurvey(false);
      setStatusMessage(Tebrikler! Görüşleriniz kaydedildi ve +${earned} puan cüzdanınıza eklendi! 🎉);
      setLoading(false);
      setOpenFeedback('');
    }, 1300);
  };

  // Giriş Yapılmamışsa Gösterilecek Ekran
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#091024', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '390px', boxShadow: '0 20px 45px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '38px', marginBottom: '4px' }}>🎯</div>
            <h1 style={{ color: '#0284c7', margin: 0, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>AdVantage</h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Açık Hava Reklam Ölçümleme Platformu</p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegisterMode && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>E-Posta Adresi</label>
              <input
                type="email"
                placeholder="ad@ornek.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Şifre</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '6px' }}
            >
              {isRegisterMode ? 'Kayıt Ol ve +100 Puan Kazan' : 'Giriş Yap'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
            >
              {isRegisterMode ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Yeni hesap açın'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#091024', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '70px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* CSS Animasyonları */}
      <style>{`
        @keyframes flyToWallet {
          0% {
            transform: translate(0, 0) scale(1.3) rotate(0deg);
            opacity: 1;
          }
          40% {
            transform: translate(calc(var(--rand-x) * 1px), -100px) scale(1.6) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(calc(110px + var(--rand-offset) * 1px), -460px) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes walletBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.22); background-color: #fef08a; }
          100% { transform: scale(1); }
        }
        .coin-particle {
          position: fixed;
          left: 45%;
          top: 60%;
          font-size: 30px;
          pointer-events: none;
          z-index: 100;
          animation: flyToWallet 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .wallet-bump {
          animation: walletBounce 0.45s ease-in-out;
        }
      `}</style>

      {/* 6 Adet Uçuşan Altın Para */}
      {showCoins && (
        <>
          <div className="coin-particle" style={{ '--rand-x': '-70', '--rand-offset': '10', animationDelay: '0ms' }}>🪙</div>
          <div className="coin-particle" style={{ '--rand-x': '60', '--rand-offset': '25', animationDelay: '70ms' }}>🪙</div>
          <div className="coin-particle" style={{ '--rand-x': '-110', '--rand-offset': '5', animationDelay: '140ms' }}>🪙</div>
          <div className="coin-particle" style={{ '--rand-x': '90', '--rand-offset': '15', animationDelay: '210ms' }}>🪙</div>
          <div className="coin-particle" style={{ '--rand-x': '-35', '--rand-offset': '35', animationDelay: '270ms' }}>🪙</div>
          <div className="coin-particle" style={{ '--rand-x': '30', '--rand-offset': '20', animationDelay: '320ms' }}>🪙</div>
        </>
      )}

      {/* Üst Bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '20px', width: '42px', height: '42px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ☰
          </button>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>AdVantage</span>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Açık Hava Reklam Analizi</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cüzdan / Puan Rozeti */}
          <div
            className={coinBounce ? 'wallet-bump' : ''}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '800',
              fontSize: '13px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.2s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>💰</span>
            <span>{currentUser.points} Puan</span>
          </div>

          <div
            style={{ fontSize: '26px', cursor: 'pointer', background: '#1e293b', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}
            onClick={() => setIsDrawerOpen(true)}
          >
            {currentUser.avatar}
          </div>
        </div>
      </header>

      {/* Sol Çekmece Menü (Drawer) */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            onClick={() => setIsDrawerOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
          />
          <div style={{ position: 'relative', width: '310px', backgroundColor: '#ffffff', color: '#0f172a', height: '100%', padding: '24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '4px 0 25px rgba(0,0,0,0.4)', zIndex: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#0369a1', fontSize: '18px', fontWeight: '800' }}>Kullanıcı Profili</h3>
                <button onClick={() => setIsDrawerOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
              </div>

              {/* Kullanıcı Kartı */}
              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '6px' }}>{currentUser.avatar}</div>
                <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a' }}>{currentUser.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{currentUser.email}</div>
                <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: '#0284c7', color: '#fff', padding: '5px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' }}>
                  Toplam: {currentUser.points} Puan
                </div>
              </div>

              {/* Avatar Seçici */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>Avatarını Seç:</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      onClick={() => changeAvatar(av)}
                      style={{ fontSize: '24px', padding: '8px', borderRadius: '12px', border: currentUser.avatar === av ? '2px solid #0284c7' : '1px solid #cbd5e1', backgroundColor: currentUser.avatar === av ? '#e0f2fe' : '#ffffff', cursor: 'pointer' }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menü Sekmeleri */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => { setActiveTab('campaigns'); setIsDrawerOpen(false); }}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'campaigns' ? '#e0f2fe' : 'transparent', color: activeTab === 'campaigns' ? '#0369a1' : '#334155', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  🎯 Kampanyalar & Görevler
                </button>
                <button
                  onClick={() => { setActiveTab('rewards'); setIsDrawerOpen(false); }}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'rewards' ? '#e0f2fe' : '#f8fafc', color: activeTab === 'rewards' ? '#0369a1' : '#334155', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  🎁 Ödül Mağazası & Kuponlar
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      {/* Ana Gövde */}
      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Durum Bildirim Kutusu */}
        {statusMessage && (
          <div style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '14px 18px', borderRadius: '14px', marginBottom: '18px', fontSize: '13px', lineHeight: '1.4', boxShadow: '0 4px 14px rgba(2,132,199,0.3)', fontWeight: '500' }}>
            {statusMessage}
          </div>
        )}

        {/* Ödüller Sekmesi */}
        {activeTab === 'rewards' && (
          <div>
            <h2 style={{ fontSize: '19px', marginBottom: '14px', color: '#38bdf8' }}>Kullanılabilir Ödüller</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '18px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>50 TL Kahve Çeki</div>
                <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 12px 0' }}>Kurukahveci Mehmet Efendi ve tüm kahvecilerde geçerlidir.</div>
                <button disabled={currentUser.points < 150} style={{ backgroundColor: currentUser.points >= 150 ? '#0284c7' : '#cbd5e1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: currentUser.points >= 150 ? 'pointer' : 'not-allowed' }}>
                  150 Puan
                </button>
              </div>

              <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '18px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Koton %20 İndirim Kuponu</div>
                <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 12px 0' }}>Tüm yeni sezon mağaza ve online alışverişlerde geçerlidir.</div>
                <button disabled={currentUser.points < 250} style={{ backgroundColor: currentUser.points >= 250 ? '#0284c7' : '#cbd5e1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: currentUser.points >= 250 ? 'pointer' : 'not-allowed' }}>
                  250 Puan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kampanyalar Sekmesi */}
        {activeTab === 'campaigns' && (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', margin: '0 0 6px 0', color: '#f8fafc', fontWeight: '800' }}>Yakındaki Billboard Görevleri</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Bir reklam seçin, panoyu fotoğraflayın ve etki anketini yanıtlayın.</p>
            </div>

            {/* Dikey Kaydırılabilir Kartlar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {CAMPAIGNS.map((c) => {
                const isSelected = selectedCampaign?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCampaign(c);
                      setShowSurvey(false);
                      setStatusMessage("${c.title}" görevi seçildi. Şimdi panoyu fotoğraflayın.);
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      padding: '16px 18px',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #38bdf8' : '2px solid transparent',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ fontSize: '30px', backgroundColor: '#f1f5f9', width: '54px', height: '54px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.banner}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>{c.category}</span>
                          <h3 style={{ margin: '2px 0 0 0', fontSize: '15px', color: '#1e293b' }}>{c.title}</h3>
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                        +{c.reward_points} Puan
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kamera Çekim Alanı */}
            {selectedCampaign && !showSurvey && (
              <div style={{ marginTop: '22px', backgroundColor: '#1e293b', padding: '22px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #38bdf8' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#38bdf8' }}>
                  {selectedCampaign.brand_name} Panosunu Fotoğraflayın
                </h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>
                  Görsel doğrulandığında 6 soruluk etki araştırması açılacaktır.
                </p>

                <label style={{ display: 'inline-block', backgroundColor: '#0284c7', color: '#fff', padding: '12px 28px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  📷 Kamerayı Aç ve Çek
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleImageCapture}
                  />
                </label>
              </div>
            )}

            {/* 6 Soruluk Reklam Etki ve Tüketici Algısı Anketi */}
            {showSurvey && selectedCampaign && (
              <form onSubmit={handleSurveySubmit} style={{ marginTop: '24px', backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '24px', boxShadow: '0 12px 35px rgba(0,0,0,0.35)' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>Pazar Araştırması & Saha Doğrulama</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '17px', color: '#0f172a' }}>
                    {selectedCampaign.brand_name} Reklam Değerlendirmesi
                  </h3>
                </div>

                {/* Soru 1 */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    1. Bu reklam panosu çevredeki unsurlara kıyasla ne kadar dikkat çekiciydi?
                  </label>
                  <select value={q1} onChange={(e) => setQ1(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Çok Dikkat Çekici (Hemen fark ettim)</option>
                    <option>Orta Düzeyde (Normal bir afiş kadar)</option>
                    <option>Zayıf (Fark etmek güçtü)</option>
                    <option>Hiç Dikkat Çekici Değil</option>
                  </select>
                </div>

                {/* Soru 2 */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    2. Reklamın vermek istediği ana mesaj veya ürün net anlaşıldı mı?
                  </label>
                  <select value={q2} onChange={(e) => setQ2(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Oldukça Açık ve Anlaşılır</option>
                    <option>Kısmen Anlaşılır (Biraz düşünmek gerekti)</option>
                    <option>Karışık / Mesaj Belirsiz</option>
                  </select>
                </div>

                {/* Soru 3 */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    3. Reklamın görsel tasarımı, renkleri ve estetiği sizde nasıl bir his bıraktı?
                  </label>
                  <select value={q3} onChange={(e) => setQ3(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Tasarım Çok Başarılı & İlgi Çekici</option>
                    <option>Sıradan / Standart</option>
                    <option>Göz Yoran / İlgisiz</option>
                  </select>
                </div>

                {/* Soru 4 */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    4. Bu reklamı görmek, söz konusu markadan alışveriş yapma / ürünü deneme isteğinizi etkiledi mi?
                  </label>
                  <select value={q4} onChange={(e) => setQ4(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Evet, Kesinlikle Satın Alma İsteği Uyandırdı</option>
                    <option>Markaya Olan İlgimi/Sempatimi Artırdı</option>
                    <option>Kararımı Değiştirmedi (Nötr)</option>
                    <option>Olumsuz Etkiledi</option>
                  </select>
                </div>

                {/* Soru 5 */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    5. Panonun fiziki konumu, aydınlatması ve okunabilirliği nasıldı?
                  </label>
                  <select value={q5} onChange={(e) => setQ5(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Kusursuz / Çok Net Görünüyor</option>
                    <option>Aydınlatma Yetersiz / Soluk</option>
                    <option>Önünde Engel Var (Ağaç, direk, bina vb.)</option>
                    <option>Fiziksel Olarak Hasarlı / Yırtık</option>
                  </select>
                </div>

                {/* Soru 6 (Açık Uçlu) */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    6. Bu reklam veya marka hakkındaki kişisel fikir ve önerileriniz nelerdir?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reklam hakkındaki kendi görüşlerinizi, önerilerinizi veya hissettiklerinizi buraya yazabilirsiniz..."
                    value={openFeedback}
                    onChange={(e) => setOpenFeedback(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,199,0.4)' }}
                >
                  {loading ? 'Kaydediliyor...' : Değerlendirmeyi Tamamla (+${selectedCampaign.reward_points} Puan)}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
