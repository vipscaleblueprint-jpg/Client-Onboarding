import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Note: You can register custom fonts here if desired for a more premium look.
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeAmM.woff2' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #e63968',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#e63968',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#e63968',
    textTransform: 'uppercase',
    marginBottom: 10,
    borderBottom: '1px solid #f1f3f5',
    paddingBottom: 4,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '35%',
    fontSize: 10,
    color: '#6c757d',
    textTransform: 'uppercase',
    paddingRight: 10,
  },
  value: {
    width: '65%',
    fontSize: 12,
    color: '#212529',
  },
  summaryBlock: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff0f3',
    borderRadius: 8,
    borderLeft: '4px solid #e63968',
  },
  summaryText: {
    fontSize: 12,
    color: '#212529',
    lineHeight: 1.5,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#e63968',
  }
});

const getMultiselectString = (formData, key) => {
  const answer = formData[key];
  if (Array.isArray(answer)) {
    return answer.map(a => a === 'Others' && formData[`${key}Others`] ? formData[`${key}Others`] : a).join(', ');
  }
  return answer || 'Not answered';
};

const PdfDocument = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Client Onboarding</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{formData.name || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{formData.email || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Business Name</Text>
          <Text style={styles.value}>{formData.businessName || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Business Website</Text>
          <Text style={styles.value}>{formData.businessWebsite || 'Not answered'}</Text>
        </View>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryText}>
            I am a <Text style={styles.boldText}>{formData.profession || '___'}</Text> who helps <Text style={styles.boldText}>{formData.aboutClients || '___'}</Text> achieve <Text style={styles.boldText}>{formData.aboutGoal || '___'}</Text> without <Text style={styles.boldText}>{formData.aboutPainPoints || '___'}</Text>.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Product Name</Text>
          <Text style={styles.value}>{formData.productName || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>What's included?</Text>
          <Text style={styles.value}>{formData.included || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>What makes it different?</Text>
          <Text style={styles.value}>{formData.different || 'Not answered'}</Text>
        </View>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryText}>
            My <Text style={styles.boldText}>{formData.productType || '___'}</Text> helps <Text style={styles.boldText}>{formData.productClients || '___'}</Text> achieve <Text style={styles.boldText}>{formData.productGoal || '___'}</Text> by <Text style={styles.boldText}>{formData.productHow || '___'}</Text>.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>{formData.price || 'Not answered'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pricing Structure</Text>
          <Text style={styles.value}>{getMultiselectString(formData, 'pricingStructure')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audience</Text>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryText}>
            This is ideal for <Text style={styles.boldText}>{formData.idealClients || '___'}</Text> who <Text style={styles.boldText}>{formData.idealSituation || '___'}</Text>
            {formData.notIdealSituation ? <Text> but is not ideal for <Text style={styles.boldText}>{formData.notIdealSituation}</Text></Text> : ''}.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Anything else we should know?</Text>
          <Text style={styles.value}>{formData.additionalInfo || 'Not answered'}</Text>
        </View>
      </View>

    </Page>
  </Document>
);

export default PdfDocument;
