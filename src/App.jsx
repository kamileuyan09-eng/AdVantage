import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [points, setPoints] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');

  const [showSurvey, setShowSurvey] = useState(false);
  const [q1Score, setQ1Score] = useState(5);
  const [q2Score, setQ2Score] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setPoints(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCampaigns();
    getUserLocation();
  }, []);

  const fetchCampaigns = async () => {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (!error && data) setCampaigns(data);
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('points').eq('id', userId).single();
    if (!error && data) setPoints(data.points || 0);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStatusMessage("Konum alindi.");
        },
        () => setStatusMessage("Konum izni verilmedi.")
      );
    }
  };

  const handleAuth = async (isSignUp) => {
    setLoading(true);
    setStatusMessage("");
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatusMessage(error.message);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCampaign) return;

    setLoading(true);
    setStatusMessage("Gorsel OCR ile analiz ediliyor...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', import.meta.env.VITE_OCR_SPACE_API_KEY);
    formData.append('language', 'tur');

    try {
      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const parsedText = (result.ParsedResults[0].ParsedText || '').toLowerCase();
        const matched = selectedCampaign.target_keywords && selectedCampaign.target_keywords.some(kw =>
          parsedText.includes(kw.toLowerCase())
        );

        if (matched) {
          setShowSurvey(true);
          setStatusMessage("Pano dogrulandi! Lutfen degerlendirmeyi tamamlayin.");
        } else {
          setStatusMessage("Reklam eslesmedi. Pano net gorunmuyor olabilir.");
        }
      } else {
        setStatusMessage("Gorselde yazi algilanamadi.");
      }
    } catch (err) {
      setStatusMessage("OCR dogrulama hatasi olustu.");
    }
    setLoading(false);
  };

  const submitSurvey = async () => {
    if (!user || !selectedCampaign) return;
    setLoading(true);

    try {
      await supabase.from('submissions').insert([
        {
          user_id: user.id,
          campaign_id: selectedCampaign.id,
          q1_score: q1Score,
          q2_score: q2Score,
          feedback: feedback
        }
      ]);

      const reward = selectedCampaign.reward_points || 50;
      const newPoints = points + reward;
      await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);

      setPoints(newPoints);
      setShowSurvey(false);
      setSelectedCampaign(null);
      setFeedback("");
      setStatusMessage("Degerlendirme kaydedildi ve puaniniz yuklendi!");
    } catch (err) {
      setStatusMessage("Kayit basarisiz oldu.");
    }
    setLoading(false);
  };

  const locText = userLocation ? (userLocation.lat.toFixed(3) + ", " + userLocation.lng.toFixed(3)) : "Konum araniyor...";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "16px", fontFamily: "sans-serif" }}>
      <header style={{ maxWidth: "480px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #334155" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#38bdf8", margin: 0 }}>AdVantage</h1>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Acik Hava Reklam Dogrulama</span>
        </div>
        {user && (
          <div style={{ background: "#1e293b", border: "1px solid #f59e0b", padding: "6px 14px", borderRadius: "20px", fontWeight: "bold", color: "#facc15", fontSize: "14px" }}>
            {points} Puan
          </div>
        )}
      </header>

      <main style={{ maxWidth: "480px", margin: "16px auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {user && (
          <div style={{ display: "flex", gap: "8px", background: "#1e293b", padding: "4px", borderRadius: "12px" }}>
            <button
              onClick={() => setActiveTab("scan")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "scan" ? "#0284c7" : "transparent",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Panolar
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "rewards" ? "#0284c7" : "transparent",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Oduller
            </button>
          </div>
        )}

        {user && activeTab === "scan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#1e293b", padding: "12px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>{locText}</span>
              <button onClick={getUserLocation} style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                Yenile
              </button>
            </div>

            <h3 style={{ fontSize: "15px", margin: 0, color: "#cbd5e1" }}>Yakin Kampanyalar</h3>
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCampaign(c);
                  setShowSurvey(false);
                }}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  border: selectedCampaign && selectedCampaign.id === c.id ? "2px solid #38bdf8" : "1px solid #334155",
                  background: selectedCampaign && selectedCampaign.id === c.id ? "#082f49" : "#1e293b",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#fff" }}>{c.brand_name}</h4>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Anahtar Kelimeler: {c.target_keywords ? c.target_keywords.join(", ") : ""}</span>
                </div>
                <span style={{ background: "#854d0e", color: "#fef08a", padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                  +{c.reward_points} Puan
                </span>
              </div>
            ))}

            {selectedCampaign && !showSurvey && (
              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", border: "1px dashed #38bdf8" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0" }}>
                  <strong>{selectedCampaign.brand_name}</strong> panosunun fotografini cekin:
                </p>
                <label style={{ display: "inline-block", background: "#0284c7", color: "#fff", padding: "14px 28px", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>
                  <span>Kamerayi Ac</span>
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoUpload} disabled={loading} />
                </label>
              </div>
            )}

            {showSurvey && (
              <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "14px", border: "1px solid #10b981" }}>
                <h4 style={{ margin: 0, color: "#10b981", fontSize: "16px" }}>Pano Dogrulandi! Hizli Geri Bildirim:</h4>
                <div>
                  <label style={{ fontSize: "13px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>1. Tasarim dikkatinizi cekti mi? (1-5):</label>
                  <input type="range" min="1" max="5" value={q1Score} onChange={(e) => setQ1Score(Number(e.target.value))} style={{ width: "100%" }} />
                  <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "bold" }}>Skor: {q1Score} / 5</span>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>2. Satin alma istegi uyandirdi mi? (1-5):</label>
                  <input type="range" min="1" max="5" value={q2Score} onChange={(e) => setQ2Score(Number(e.target.value))} style={{ width: "100%" }} />
                  <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "bold" }}>Skor: {q2Score} / 5</span>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>Notunuz (Opsiyonel):</label>
                  <input
                    type="text"
                    placeholder="Kisa gorusunuz..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", fontSize: "13px" }}
                  />
                </div>
                <button
                  onClick={submitSurvey}
                  disabled={loading}
                  style={{ background: "#10b981", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {loading ? "Kaydediliyor..." : "Gonder ve Puani Al"}
                </button>
              </div>
            )}
          </div>
        )}

        {user && activeTab === "rewards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "15px", margin: 0, color: "#cbd5e1" }}>Kullanilabilir Oduller</h3>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "14px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#fff" }}>Starbucks Filtre Kahve</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Tum subelerde gecerli</p>
              </div>
              <button disabled={points < 100} style={{ background: points >= 100 ? "#f59e0b" : "#334155", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px" }}>
                100 Puan
              </button>
            </div>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "14px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#fff" }}>%15 Indirim Kuponu</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Online alisverislerde gecerli</p>
              </div>
              <button disabled={points < 250} style={{ background: points >= 250 ? "#f59e0b" : "#334155", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px" }}>
                250 Puan
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div style={{ background: "#1e293b", border: "1px solid #38bdf8", padding: "12px", borderRadius: "10px", fontSize: "13px", textAlign: "center", color: "#e0f2fe" }}>
            {statusMessage}
          </div>
        )}
      </main>
    </div>
  );
}
