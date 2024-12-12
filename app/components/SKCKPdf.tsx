'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { SKCKApplication } from '../types/skck';

// Register custom font if needed
Font.register({
  family: 'Times New Roman',
  src: 'https://fonts.cdnfonts.com/s/55/times new roman.woff',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Times New Roman',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 20,
  },
  label: {
    width: 150,
  },
  separator: {
    width: 20,
    textAlign: 'center',
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 40,
    textAlign: 'right',
    paddingRight: 40,
  },
  photoFrame: {
    width: 90,
    height: 120,
    border: 1,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    paddingTop: 50,
  },
});

export const SKCKPdf = ({ data }: { data: SKCKApplication }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerText}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</Text>
        <Text style={styles.headerText}>DAERAH KALIMANTAN BARAT</Text>
        <Text style={styles.headerText}>RESOR KOTA PONTIANAK KOTA</Text>
        <Text style={styles.headerText}>Jalan Gusti Johan Idrus No.1 Pontianak 78121</Text>
        <Image src="/Polri.png" style={styles.logo} />
        <Text style={styles.title}>SURAT KETERANGAN CATATAN KEPOLISIAN</Text>
        <Text style={styles.subtitle}>POLICE RECORD</Text>
        <Text>Nomor : SKCK/YANMAS/33781/X1/2023/INTELKAM</Text>
      </View>

      <View>
        <Text style={{ marginBottom: 10, paddingLeft: 20 }}>
          Di terangkan bersama ini bahwa :
        </Text>
        <Text style={{ marginBottom: 10, paddingLeft: 20, fontStyle: 'italic' }}>
          This is to certify that :
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Nama</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.namaLengkap}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.jenisKelamin}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Kebangsaan</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>Indonesia</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Agama</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.agama}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tempat/Tanggal Lahir</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>
            {`${data.tempatLahir}, ${new Date(data.tanggalLahir).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tempat Tinggal</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>
            {`${data.alamatLengkap}, RT ${data.rt}/RW ${data.rw}, ${data.kelurahan}, ${data.kecamatan}, ${data.kota}, ${data.provinsi} ${data.kodePos}`}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Pekerjaan</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.pekerjaan}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Nomor KTP</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.nik}</Text>
        </View>

        <View style={{ marginTop: 20, paddingLeft: 20 }}>
          <Text style={{ marginBottom: 10 }}>
            Bahwa nama tersebut diatas tidak memiliki catatan atau keterlibatan dalam kegiatan kriminal apapun
          </Text>
          <Text style={{ marginBottom: 10, fontStyle: 'italic' }}>
            (the bearer hereof proves not to be involved in any criminal cases)
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{`Pontianak, ${new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}`}</Text>
          <Text style={{ marginTop: 10 }}>an. KEPALA KEPOLISIAN RESOR KOTA PONTIANAK KOTA</Text>
          <Text>KEPALA SATUAN INTELKAM</Text>
          <View style={{ height: 50 }} />
          <Text style={{ textDecoration: 'underline' }}>HUDAALLAH, SH</Text>
          <Text>KOMISARIS POLISI NRP 66050254</Text>
        </View>

        <View style={styles.photoFrame}>
          <Text>4X6</Text>
        </View>
      </View>
    </Page>
  </Document>
); 