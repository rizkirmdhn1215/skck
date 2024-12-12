'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Divider,
} from '@mui/material';
import { FiChevronDown, FiMessageCircle, FiPhone, FiMail } from 'react-icons/fi';
import TawkToChat from '../components/TawkToChat';

const faqData = [
  {
    question: 'Apa itu SKCK?',
    answer: 'SKCK (Surat Keterangan Catatan Kepolisian) adalah surat keterangan resmi yang dikeluarkan oleh Polri kepada seseorang untuk memenuhi permohonan dari yang bersangkutan atau suatu keperluan.'
  },
  {
    question: 'Berapa lama proses pembuatan SKCK?',
    answer: 'Proses pembuatan SKCK umumnya memakan waktu 1-3 hari kerja setelah semua persyaratan dipenuhi dan diverifikasi.'
  },
  {
    question: 'Apa saja syarat pembuatan SKCK?',
    answer: 'Syarat utama meliputi: KTP asli, fotokopi KTP, pas foto terbaru, dan surat pengantar dari kelurahan/desa. Persyaratan tambahan mungkin diperlukan sesuai keperluan.'
  },
  {
    question: 'Berapa lama SKCK berlaku?',
    answer: 'SKCK berlaku selama 6 bulan sejak tanggal diterbitkan.'
  },
  // Add more FAQs as needed
];

export default function BantuanPage() {
  const { handleStartChat } = TawkToChat();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Add your contact form submission logic here
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Pusat Bantuan
        </Typography>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Pertanyaan yang Sering Diajukan
            </Typography>
            <div className="mt-4">
              {faqData.map((faq, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<FiChevronDown />}>
                    <Typography fontWeight="medium">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Hubungi Kami
              </Typography>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <TextField
                  fullWidth
                  label="Nama"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Pesan"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  Kirim Pesan
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Informasi Kontak
              </Typography>
              <div className="space-y-4">
                <Box display="flex" alignItems="center" gap={2}>
                  <FiPhone className="text-2xl" />
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Telepon
                    </Typography>
                    <Typography>
                      (021) 123-4567
                    </Typography>
                  </div>
                </Box>
                <Divider />
                <Box display="flex" alignItems="center" gap={2}>
                  <FiMail className="text-2xl" />
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Email
                    </Typography>
                    <Typography>
                      bantuan@skck.polri.go.id
                    </Typography>
                  </div>
                </Box>
                <Divider />
                <Box display="flex" alignItems="center" gap={2}>
                  <FiMessageCircle className="text-2xl" />
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Live Chat
                    </Typography>
                    <Typography>
                      Tersedia 24/7
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      className="mt-2"
                      onClick={handleStartChat}
                    >
                      Mulai Chat
                    </Button>
                  </div>
                </Box>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 