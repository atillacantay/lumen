import { getBannerAdUnitId } from "@/services/admob-service";
import { errorLogger } from "@/services/error-logger";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

interface AdBannerProps {
  visible?: boolean;
}

export function AdBanner({ visible = true }: AdBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={async (error) => {
          errorLogger.logError(error, {
            action: "AdBanner onAdFailedToLoad",
            screen: "AdBanner",
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
});
