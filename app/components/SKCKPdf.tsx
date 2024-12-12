'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { SKCKApplication } from '../types/skck';


// Register Times New Roman fonts
Font.register({
  family: 'Times New Roman',
  fonts: [
    {
      src: '/fonts/times-new-roman.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/times-new-roman-bold.ttf',
      fontWeight: 'bold',
    },
    {
      src: '/fonts/times-new-roman-italic.ttf',
      fontStyle: 'italic',
    },
    {
      src: '/fonts/times-new-roman-bold-italic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
}); 

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Times New Roman',
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerContent: {
    marginBottom: 10,
    marginLeft: 20,
    width: 300,
    alignSelf: 'flex-start',
  },
  logo: {
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 3,
    fontWeight: 'bold',
  },
  documentNumber: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  italicLabel: {
    fontStyle: 'italic',
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 40,
  },
  label: {
    width: 200,
  },
  separator: {
    width: 20,
    textAlign: 'center',
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    paddingLeft: 40,
  },
  signatureSection: {
    marginLeft: 'auto',
    textAlign: 'left',
    width: 350,
  },
  photoFrame: {
    width: 80,
    height: 100,
    border: 1,
    position: 'absolute',
    left: 40,
    bottom: 0,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const SKCKPdf = ({ data }: { data: SKCKApplication }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</Text>
          <Text style={styles.headerText}>DAERAH KALIMANTAN BARAT</Text>
          <Text style={styles.headerText}>RESOR KOTA PONTIANAK KOTA</Text>
          <Text style={styles.headerText}>Jalan Gusti Johan Idrus No.1 Pontianak 78121</Text>
        </View>
        <Image src="/Polri.png" style={styles.logo} />
      </View>

      <Text style={styles.title}>SURAT KETERANGAN CATATAN KEPOLISIAN</Text>
      <Text style={[styles.title, { fontWeight: 'normal', fontSize: 12 }]}>POLICE RECORD</Text>
      <Text style={styles.documentNumber}>Nomor : SKCK/YANMAS/33781/XI/2023/INTELKAM</Text>

      <View>
        <Text style={{ marginBottom: 10, paddingLeft: 20 }}>
          Di terangkan bersama ini bahwa :
        </Text>
        <Text style={{ marginBottom: 10, paddingLeft: 20, fontStyle: 'italic' }}>
          This is to certify that :
        </Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Nama</Text>
            <Text style={styles.italicLabel}>Name</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.namaLengkap}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Jenis Kelamin</Text>
            <Text style={styles.italicLabel}>Gender</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.jenisKelamin}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Kebangsaan</Text>
            <Text style={styles.italicLabel}>Nationality</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>Indonesia</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Agama</Text>
            <Text style={styles.italicLabel}>Religion</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.agama}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Tempat/Tanggal Lahir</Text>
            <Text style={styles.italicLabel}>Place/Date of Birth</Text>
          </View>
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
          <View style={styles.label}>
            <Text>Tempat Tinggal</Text>
            <Text style={styles.italicLabel}>Address</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>
            {`${data.alamatLengkap}, RT ${data.rt}/RW ${data.rw}, ${data.kelurahan}, ${data.kecamatan}, ${data.kota}, ${data.provinsi} ${data.kodePos}`}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Pekerjaan</Text>
            <Text style={styles.italicLabel}>Occupation</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.pekerjaan}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Text>Nomor KTP</Text>
            <Text style={styles.italicLabel}>National ID Number</Text>
          </View>
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
          <View style={styles.photoFrame}>
            <Text>4X6</Text>
          </View>
          <View style={styles.signatureSection}>
            <Text>{`Dikeluarkan di : Pontianak`}</Text>
            <Text>{`Pada tanggal : ${new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`}</Text>
            <Text style={{ marginTop: 5 }}>an. KEPALA KEPOLISIAN RESOR KOTA PONTIANAK KOTA</Text>
            <Text>KEPALA SATUAN INTELKAM</Text>
            <View style={{ height: 40 }} />
            <Text style={{ textDecoration: 'underline' }}>HUDAALLAH, SH</Text>
            <Text>KOMISARIS POLISI NRP 66050254</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
); 