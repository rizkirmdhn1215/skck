import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SKCKApplication } from '../types/skck';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerSection: {
    width: '40%',
    alignItems: 'center',
  },
});

interface SKCKPdfProps {
  data: SKCKApplication;
}

export const SKCKPdf = ({ data }: SKCKPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>SURAT PENGANTAR MOHON SKCK</Text>
      <Text style={[styles.title, { fontSize: 12, marginBottom: 30 }]}>
        Nomor: ........../V/2024
      </Text>

      <Text style={{ marginBottom: 20 }}>Dengan ini menerangkan bahwa:</Text>

      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.label}>Nama lengkap</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.namaLengkap}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis kelamin</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.jenisKelamin}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Agama</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.agama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.statusPerkawinan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No KTP/ NIK</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.nik}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempat / Tanggal lahir</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>
            {data.tempatLahir} / {new Date(data.tanggalLahir).toLocaleDateString('id-ID')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pekerjaan</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.pekerjaan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.alamatLengkap}</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Keperluan</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>{data.keperluanSKCK}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Berlaku mulai tanggal</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.value}>s/d</Text>
        </View>
      </View>

      <Text style={{ marginTop: 30 }}>
        Demikian Surat Keterangan ini dibuat untuk digunakan seperlunya.
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <Text>Pemohon,</Text>
          <Text style={{ marginTop: 60 }}>{data.namaLengkap}</Text>
        </View>
        <View style={styles.footerSection}>
          <Text>Kepala Desa ............</Text>
          <Text style={{ marginTop: 60 }}>.........................</Text>
        </View>
      </View>
    </Page>
  </Document>
); 