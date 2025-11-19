import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  totalAVESection: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: 20,
    marginVertical: 20,
    borderRadius: 8,
  },
  totalAVELabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalAVEValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  channelBreakdown: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  channelCard: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dataLabel: {
    color: '#666',
  },
  dataValue: {
    fontWeight: 'bold',
  },
  outletSection: {
    marginTop: 10,
  },
  outletLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  outletCard: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid #ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: '1px solid #ddd',
    paddingTop: 10,
  },
});

interface AVEResultsPDFProps {
  finalAVE: number;
  breakdown: any[];
  brandName?: string;
  campaignName?: string;
  calculationDate: string;
}

export const AVEResultsPDF: React.FC<AVEResultsPDFProps> = ({
  finalAVE,
  breakdown,
  brandName,
  campaignName,
  calculationDate,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>AVE Calculation Report</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date(calculationDate).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        {brandName && (
          <Text style={styles.subtitle}>Brand: {brandName}</Text>
        )}
        {campaignName && (
          <Text style={styles.subtitle}>Campaign: {campaignName}</Text>
        )}
      </View>

      {/* Total AVE Section */}
      <View style={styles.totalAVESection}>
        <Text style={styles.totalAVELabel}>Total Advertising Value Equivalence</Text>
        <Text style={styles.totalAVEValue}>
          IDR {finalAVE.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
        </Text>
      </View>

      {/* Channel Breakdown Section */}
      <View style={styles.channelBreakdown}>
        <Text style={styles.sectionTitle}>Channel Breakdown</Text>
        
        {breakdown.map((item, idx) => (
          <View key={idx} style={styles.channelCard}>
            <Text style={styles.channelTitle}>{item.channel}</Text>
            
            {item.isPR ? (
              // PR Channel Layout
              <View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Formula:</Text>
                  <Text style={styles.dataValue}>{item.formula}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>eCPM Used:</Text>
                  <Text style={styles.dataValue}>IDR {item.ecpm.toLocaleString()}</Text>
                </View>
                
                <View style={styles.outletSection}>
                  <Text style={styles.outletLabel}>Selected Media Outlets:</Text>
                  
                  {item.outlets.map((outlet: any, outletIdx: number) => (
                    <View key={outletIdx} style={styles.outletCard}>
                      <Text>
                        {outlet.name} (Tier {outlet.tier})
                      </Text>
                      <Text style={styles.dataValue}>
                        IDR {outlet.ave.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total PR AVE:</Text>
                  <Text style={styles.totalValue}>
                    IDR {item.finalAVE.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            ) : (
              // Social Channel Layout
              <View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Impressions:</Text>
                  <Text style={styles.dataValue}>{item.impressions.toLocaleString()}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>CPM:</Text>
                  <Text style={styles.dataValue}>IDR {item.cpm.toLocaleString()}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Base AVE:</Text>
                  <Text style={styles.dataValue}>IDR {item.baseAVE.toLocaleString()}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Platform Multiplier:</Text>
                  <Text style={styles.dataValue}>{item.platformMult}x</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Engagement Multiplier:</Text>
                  <Text style={styles.dataValue}>{item.engagementMult}x</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Sentiment Multiplier:</Text>
                  <Text style={styles.dataValue}>{item.sentimentMult}x</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Channel AVE:</Text>
                  <Text style={styles.totalValue}>
                    IDR {item.finalAVE.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          This report was generated by the AVE Calculator | © {new Date().getFullYear()} All Rights Reserved
        </Text>
      </View>
    </Page>
  </Document>
);
