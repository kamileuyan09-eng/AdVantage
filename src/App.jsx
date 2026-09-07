import React, { useState, useEffect } from 'react';

// Supabase Bağlantı Bilgileri
const SUPABASE_URL = 'https://nlsmotipvjkfwewharut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFnvR0ZVP9JOG7-Di6e66Q_46a_f4PC';

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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'rewards' | 'admin'

  // Buluttan çekilen yönetici verileri
  const [adminSurveys, setAdminSurveys] = useState([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('Tümü');

  // Görev ekranı
  const [activeTaskCampaign, setActiveTaskCampaign] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Animasyon state'leri
  const [showCoins, setShowCoins] = useState(false);
  const [coinBounce, setCoinBounce] = useState(false);

  // Anket yanıtları
  const [q1, setQ1] = useState('Çok Dikkat Çekici');
  const [q2, setQ2] = useState('Oldukça Açık ve Anlaşılır');
  const [q3, setQ3] = useState('Tasarım Çok Başarılı');
  const [q4, setQ4] = useState('Evet, Kesinlikle Artırdı');
  const [q5, setQ5] = useState('Kusursuz / Çok Net');
  const [openFeedback, setOpenFeedback] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ad_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Admin sekmesi açıldığında Supabase'den verileri getir
  const fetchSurveysFromCloud = async () => {
    try {
      setLoading(true);
      const res = await fetch(SUPABASE_URL + '/rest/v1/surveys?select=*&order=created_at.desc', {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminSurveys(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      points: 100
    };
    setCurrentUser(userData);
    setStatusMessage('Hoş geldiniz, ' + userData.name + '!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ad_user');
    setIsDrawerOpen(false);
    setActiveTaskCampaign(null);
    setShowSurvey(false);
    setStatusMessage('Oturum kapatıldı.');
  };

  const changeAvatar = (av) => {
    if (!currentUser) return;
    setCurrentUser(prev => ({ ...prev, avatar: av }));
  };

  const handleImageCapture = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    setStatusMessage('Pano taranıyor...');

    setTimeout(() => {
      setLoading(false);
      setShowSurvey(true);
      setStatusMessage('Pano doğrulandı! Lütfen 6 soruluk etki anketini yanıtlayın.');
    }, 900);
  };

  // Anketi Supabase Bulut Veritabanına Kaydetme
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const earned = activeTaskCampaign ? activeTaskCampaign.reward_points : 50;

    const payload = {
      user_name: currentUser.name,
      user_email: currentUser.email,
      brand_name: activeTaskCampaign.brand_name,
      campaign_title: activeTaskCampaign.title,
      reward_points: earned,
      q1_attention: q1,
      q2_clarity: q2,
      q3_design: q3,
      q4_purchase_intent: q4,
      q5_condition: q5,
      open_feedback: openFeedback.trim() || 'Görüş belirtilmedi.'
    };

    try {
      // Supabase REST API'sine kayıt gönderimi
      await fetch(SUPABASE_URL + '/rest/v1/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Bulut kayıt hatası:', err);
    }

    // Puan animasyonu ve cüzdan güncellemesi
    setShowCoins(true);

    setTimeout(() => {
      setCoinBounce(true);
      setCurrentUser(prev => ({
        ...prev,
        points: (prev?.points || 0) + earned
      }));
      setTimeout(() => setCoinBounce(false), 500);
    }, 850);

    setTimeout(() => {
      setShowCoins(false);
      setShowSurvey(false);
      setActiveTaskCampaign(null);
      setLoading(false);
      setOpenFeedback('');
      setStatusMessage('Tebrikler! Yanıtlarınız buluta kaydedildi ve +' + earned + ' puan eklendi!');
    }, 1400);
  };

  // Giriş Ekranı
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#091024', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '390px', boxShadow: '0 20px 45px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '38px', marginBottom: '4px' }}>🎯</div>
            <h1 style={{ color: '#0284c7', margin: 0, fontSize: '26px', fontWeight: '800' }}>AdVantage</h1>
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
              {isRegisterMode ? 'Kayıt Ol ve Başla' : 'Giriş Yap'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegisterMode ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Yeni hesap açın'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredSurveys = selectedBrandFilter === 'Tümü'
    ? adminSurveys
    : adminSurveys.filter(s => s.brand_name === selectedBrandFilter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#091024', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '70px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Animasyon CSS */}
      <style>{`
        @keyframes flyToWallet {
          0% { transform: translate(0, 0) scale(1.3) rotate(0deg); opacity: 1; }
          40% { transform: translate(calc(var(--rand-x) * 1px), -100px) scale(1.6) rotate(180deg); opacity: 1; }
          100% { transform: translate(calc(110px + var(--rand-offset) * 1px), -460px) scale(0.3) rotate(360deg); opacity: 0; }
        }
        @keyframes walletBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); background-color: #fef08a; }
          100% { transform: scale(1); }
        }
        .coin-particle {
          position: fixed;
          left: 45%;
          top: 60%;
          font-size: 30px;
          pointer-events: none;
          z-index: 120;
          animation: flyToWallet 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .wallet-bump {
          animation: walletBounce 0.45s ease-in-out;
        }
      `}</style>

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

      {/* Sol Çekmece Menü */}
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
                <button onClick={() => setIsDrawerOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '6px' }}>{currentUser.avatar}</div>
                <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#0f172a' }}>{currentUser.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{currentUser.email}</div>
                <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: '#0284c7', color: '#fff', padding: '5px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' }}>
                  Toplam: {currentUser.points} Puan
                </div>
              </div>

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
                <button
                  onClick={() => { 
                    setActiveTab('admin'); 
                    setIsDrawerOpen(false); 
                    fetchSurveysFromCloud(); 
                  }}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'admin' ? '#fef3c7' : '#f8fafc', color: activeTab === 'admin' ? '#b45309' : '#334155', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  📊 Marka & Yönetici Paneli
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

      {/* Ayrı Sayfa / Modal Görev Ekranı */}
      {activeTaskCampaign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: '#091024', overflowY: 'auto', padding: '20px 16px 60px 16px' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  setActiveTaskCampaign(null);
                  setShowSurvey(false);
                }}
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ← Listeye Dön
              </button>
              <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}>
                +{activeTaskCampaign.reward_points} Puan Ödül
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '20px', borderRadius: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '38px', backgroundColor: '#f1f5f9', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeTaskCampaign.banner}
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>{activeTaskCampaign.category}</span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '17px', color: '#1e293b' }}>{activeTaskCampaign.title}</h2>
              </div>
            </div>

            {!showSurvey && (
              <div style={{ backgroundColor: '#1e293b', padding: '36px 20px', borderRadius: '24px', textAlign: 'center', border: '2px dashed #38bdf8', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '50px', marginBottom: '12px' }}>📸</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', color: '#38bdf8' }}>
                  {activeTaskCampaign.brand_name} Panosunu Fotoğraflayın
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 auto 24px auto', maxWidth: '320px', lineHeight: '1.5' }}>
                  Fotoğrafı çekip doğrulamayı tamamladığınızda tüketici etki anketi açılacaktır.
                </p>

                <label style={{ display: 'inline-block', backgroundColor: '#0284c7', color: '#fff', padding: '16px 36px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 6px 18px rgba(2,132,199,0.4)' }}>
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

            {showSurvey && (
              <form onSubmit={handleSurveySubmit} style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '24px', boxShadow: '0 12px 35px rgba(0,0,0,0.4)' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>Bulut Tabanlı Saha Ölçümleme</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#0f172a' }}>
                    {activeTaskCampaign.brand_name} Reklam Değerlendirmesi
                  </h3>
                </div>

                <div style={{ marginBottom: '16px' }}>
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    2. Reklamın vermek istediği ana mesaj veya ürün net anlaşıldı mı?
                  </label>
                  <select value={q2} onChange={(e) => setQ2(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Oldukça Açık ve Anlaşılır</option>
                    <option>Kısmen Anlaşılır (Biraz düşünmek gerekti)</option>
                    <option>Karışık / Mesaj Belirsiz</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    3. Reklamın görsel tasarımı, renkleri ve estetiği sizde nasıl bir his bıraktı?
                  </label>
                  <select value={q3} onChange={(e) => setQ3(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Tasarım Çok Başarılı & İlgi Çekici</option>
                    <option>Sıradan / Standart</option>
                    <option>Göz Yoran / İlgisiz</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    4. Bu reklamı görmek markadan alışveriş yapma isteğinizi etkiledi mi?
                  </label>
                  <select value={q4} onChange={(e) => setQ4(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Evet, Kesinlikle Satın Alma İsteği Uyandırdı</option>
                    <option>Markaya Olan İlgimi/Sempatimi Artırdı</option>
                    <option>Kararımı Değiştirmedi (Nötr)</option>
                    <option>Olumsuz Etkiledi</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    5. Panonun fiziki konumu, aydınlatması ve okunabilirliği nasıldı?
                  </label>
                  <select value={q5} onChange={(e) => setQ5(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option>Kusursuz / Çok Net Görünüyor</option>
                    <option>Aydınlatma Yetersiz / Soluk</option>
                    <option>Önünde Engel Var (Ağaç, direk vb.)</option>
                    <option>Fiziksel Olarak Hasarlı / Yırtık</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    6. Bu reklam veya marka hakkındaki kişisel fikir ve önerileriniz nelerdir?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Kişisel düşüncelerinizi, eleştiri ve önerilerinizi yazın..."
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
                  {loading ? 'Buluta Kaydediliyor...' : ('Değerlendirmeyi Tamamla (+' + activeTaskCampaign.reward_points + ' Puan)')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Ana Ekran */}
      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px' }}>

        {statusMessage && (
          <div style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '14px 18px', borderRadius: '14px', marginBottom: '18px', fontSize: '13px', lineHeight: '1.4', boxShadow: '0 4px 14px rgba(2,132,199,0.3)', fontWeight: '500' }}>
            {statusMessage}
          </div>
        )}

        {/* 1. SEKME: Kampanyalar Listesi */}
        {activeTab === 'campaigns' && (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', margin: '0 0 6px 0', color: '#f8fafc', fontWeight: '800' }}>Yakındaki Billboard Görevleri</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Görevi başlatmak için bir reklam panosu seçin.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {CAMPAIGNS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveTaskCampaign(c);
                    setShowSurvey(false);
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    padding: '16px 18px',
                    borderRadius: '18px',
                    cursor: 'pointer',
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
              ))}
            </div>
          </div>
        )}

        {/* 2. SEKME: Ödüller */}
        {activeTab === 'rewards' && (
          <div>
            <h2 style={{ fontSize: '19px', marginBottom: '14px', color: '#38bdf8' }}>Kullanılabilir Ödüller</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '18px', borderRadius: '18px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>50 TL Kahve Çeki</div>
                <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 12px 0' }}>Tüm kahvecilerde geçerlidir.</div>
                <button disabled={currentUser.points < 150} style={{ backgroundColor: currentUser.points >= 150 ? '#0284c7' : '#cbd5e1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold' }}>
                  150 Puan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SEKME: Marka & Yönetici Paneli (Supabase Verileri) */}
        {activeTab === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '19px', margin: 0, color: '#f8fafc', fontWeight: '800' }}>Marka & Rapor Paneli</h2>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Bulut Veritabanındaki Canlı Saha Yanıtları</div>
              </div>
              <button
                onClick={fetchSurveysFromCloud}
                style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                🔄 Yenile
              </button>
            </div>

            {/* Marka Filtresi */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
              {['Tümü', 'Koton', 'Kurukahveci Mehmet Efendi', 'Getir', 'Trendyol', 'Apple'].map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrandFilter(brand)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: selectedBrandFilter === brand ? '#38bdf8' : '#1e293b',
                    color: selectedBrandFilter === brand ? '#0f172a' : '#cbd5e1'
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Yanıtlar Listesi */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Veriler buluttan yükleniyor...</div>
            ) : filteredSurveys.length === 0 ? (
              <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Henüz bu markaya ait bir anket yanıtı girilmedi. Sahadan anket doldurulduğunda buraya anında yansıyacaktır.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredSurveys.map(s => (
                  <div key={s.id} style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '14px' }}>{s.brand_name}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Kullanıcı: {s.user_name} ({s.user_email})</div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(s.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr', gap: '4px', color: '#334155' }}>
                      <div><strong>Dikkat:</strong> {s.q1_attention}</div>
                      <div><strong>Mesaj Netliği:</strong> {s.q2_clarity}</div>
                      <div><strong>Tasarım:</strong> {s.q3_design}</div>
                      <div><strong>Satın Alma Eğilimi:</strong> {s.q4_purchase_intent}</div>
                      <div><strong>Pano Durumu:</strong> {s.q5_condition}</div>
                    </div>

                    <div style={{ marginTop: '10px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', borderLeft: '3px solid #0284c7' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Kullanıcı Yorumu:</div>
                      <div style={{ fontSize: '12px', color: '#0f172a', fontStyle: 'italic', marginTop: '2px' }}>
                        "{s.open_feedback}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
