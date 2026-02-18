"use client";

import { useState } from "react";

export default function AboutFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaq, setShowAllFaq] = useState(false);

  const gameTags = [
    "Top Up Free Fire",
    "Top Up Mobile Legends",
    "Top Up Blood Strike",
    "Top Up Free Fire Max",
    "Top Up PUBG Mobile",
    "Top Up Crystal of Atlan",
    "Top Up Ragnarok M Classic",
    "Top Up Undawn",
    "Top Up Valorant",
    "Top Up Rbx Rbl",
  ];

  const faqs = [
    {
      question: "Apakah top up game di Whuzpay aman dan legal?",
      answer:
        "Whuzpay adalah platform top up game terpercaya di Indonesia. Seluruh transaksi dijamin aman dengan sistem enkripsi terkini. Kami bekerja sama dengan developer game resmi untuk memastikan semua transaksi legal dan sesuai ketentuan.",
    },
    {
      question: "Apa saja keuntungan top up game di Whuzpay?",
      answer:
        "Berbagai keuntungan menanti Anda: proses instan 24/7, harga kompetitif dengan promo menarik, metode pembayaran lengkap, customer service responsif, dan sistem keamanan berlapis untuk melindungi data Anda.",
    },
    {
      question: "Berapa lama proses top up selesai?",
      answer:
        "Proses top up di Whuzpay sangat cepat, biasanya selesai dalam 1-5 menit setelah pembayaran dikonfirmasi. Untuk beberapa game tertentu, proses bisa lebih cepat yakni kurang dari 1 menit.",
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer:
        "Kami menyediakan berbagai metode pembayaran untuk kemudahan Anda: Transfer Bank (BCA, BRI, Mandiri, BNI), E-Wallet (GoPay, OVO, DANA, ShopeePay), QRIS, Virtual Account, dan pulsa.",
    },
    {
      question: "Bagaimana cara top up game di Whuzpay?",
      answer:
        "Sangat mudah! Pilih game yang ingin di-top up, masukkan ID game Anda, pilih nominal diamond/UC yang diinginkan, pilih metode pembayaran, lakukan pembayaran, dan diamond/UC akan otomatis masuk ke akun game Anda.",
    },
    {
      question: "Apakah ada biaya admin untuk setiap transaksi?",
      answer:
        "Tidak ada biaya admin tersembunyi di Whuzpay. Harga yang tertera sudah final dan sudah termasuk semua biaya. Kami berkomitmen untuk transparansi harga kepada semua pelanggan.",
    },
    {
      question: "Bagaimana jika top up saya gagal atau terlambat?",
      answer:
        "Jika terjadi kendala, tim customer service kami siap membantu 24/7 melalui WhatsApp atau Live Chat. Kami akan segera memproses pengembalian dana atau menyelesaikan masalah top up Anda dengan cepat.",
    },
  ];

  const displayedFaqs = showAllFaq ? faqs : faqs.slice(0, 5);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="mt-8 space-y-8">
      {/* About Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-[14px] font-bold text-slate-800 mb-4">Top Up Game</h2>
        <div className="text-slate-600 text-sm leading-relaxed space-y-3">
          <p>
            Whuzpay adalah tempat top up game termurah di Indonesia. Seluruh gamer bisa top up, beli voucher game, item in-game, dan
            produk digital lainnya dengan aman. Bukan hanya bisa membeli voucher game atau top up game murah, aman, dan legal, kamu juga
            bisa berjualan dengan{" "}
            <span className="text-blue-600 font-medium">menjadi seller</span> atau{" "}
            <span className="text-blue-600 font-medium">menjadi mitra</span> di Whuzpay dengan nyaman dan pastinya semakin cuan!
          </p>
        </div>

        {/* Game Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {gameTags.map((tag, idx) => (
            <button
              key={idx}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-sm font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-4">
            <h2 className="text-[14px] font-bold text-slate-800 mb-2">Paling Sering Ditanyakan:</h2>
        <p className="text-slate-500 text-sm mb-6">Temukan jawaban untuk pertanyaan umum seputar layanan kami</p>

        <div className="space-y-3">
          {displayedFaqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-purple-600 font-semibold text-[12px] pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === idx ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {!showAllFaq && faqs.length > 5 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllFaq(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Baca Selengkapnya
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Show Less Button */}
        {showAllFaq && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowAllFaq(false);
                setOpenFaq(null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Tampilkan Lebih Sedikit
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        </div>
      </div>

      {/* FAQ Section */}
    </div>
  );
}
