import { Document, Page, View, Text } from '@react-pdf/renderer';

export function LoadingPDFIndicator() {
  return (
    <Document>
      <Page size="A4">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            height: '100%',
          }}
        >
          <Text style={{ fontSize: 12, marginBottom: 10 }}>Generating Report...</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Please wait while we fetch your data</Text>
        </View>
      </Page>
    </Document>
  );
}
