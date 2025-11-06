/* eslint-disable jsx-a11y/alt-text */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
  },
  h1: {
    fontWeight: "bold",
    fontSize: 12,
  },
  h2: {
    fontSize: 10,
  },
});

export function PDFReportHeader() {
  return (
    <View style={styles.header}>
      <Image src="/assets/images/logo.png" style={styles.image} />
      <View style={styles.headerText}>
        <Text style={styles.h1}>GENERAL SANTOS CITY WATER DISTRICT</Text>
        <Text style={styles.h2}>
          E. Fernandez St., Lagao, General Santos City
        </Text>
      </View>
    </View>
  );
}
