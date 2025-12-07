import { errorLogger } from "@/services/error-logger";
import { Platform } from "react-native";
import {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  MobileAds,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

// Initialize Mobile Ads SDK
export const initAdmob = async (): Promise<void> => {
  try {
    await MobileAds().initialize();
  } catch (error) {
    await errorLogger.logError(error, {
      action: "initAdmob",
      screen: "AdService",
    });
  }
};

// Platform-specific Ad Unit IDs
const APP_OPEN_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3940256099942544/5662855259",
  android: "ca-app-pub-3940256099942544/3419835294",
});

const BANNER_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3940256099942544/2934735716",
  android: "ca-app-pub-3940256099942544/6300978111",
});

const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3940256099942544/4411468910",
  android: "ca-app-pub-3940256099942544/1033173712",
});

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3940256099942544/1712485313",
  android: "ca-app-pub-3940256099942544/5224354917",
});

// Interstitial ad instance
let interstitialAd: InterstitialAd | null = null;

// Rewarded ad instance
let rewardedAd: RewardedAd | null = null;

export const showAppOpenAd = async (unitId: string): Promise<void> => {
  try {
    const appOpenAd = AppOpenAd.createForAdRequest(unitId);

    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      if (appOpenAd) {
        appOpenAd.show();
      }
    });

    appOpenAd.addAdEventListener(AdEventType.ERROR, async (error) => {
      await errorLogger.logError(error, {
        action: "loadAppOpenAd",
        screen: "AdService",
      });
    });

    appOpenAd.load();
  } catch (error) {
    await errorLogger.logError(error, {
      action: "loadAppOpenAd",
      screen: "AdService",
    });
  }
};

export const loadInterstitialAd = async (): Promise<void> => {
  try {
    const unitId = getInterstitialAdUnitId();
    interstitialAd = InterstitialAd.createForAdRequest(unitId);

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Interstitial ad loaded");
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, async (error) => {
      await errorLogger.logError(error, {
        action: "loadInterstitialAd",
        screen: "AdService",
      });
    });

    interstitialAd.load();
  } catch (error) {
    await errorLogger.logError(error, {
      action: "loadInterstitialAd",
      screen: "AdService",
    });
  }
};

export const showInterstitialAd = async (): Promise<void> => {
  try {
    if (interstitialAd?.loaded) {
      await interstitialAd.show();
      await loadInterstitialAd();
    }
  } catch (error) {
    await errorLogger.logError(error, {
      action: "showInterstitialAd",
      screen: "AdService",
    });
  }
};

export const loadRewardedAd = async (): Promise<void> => {
  try {
    const unitId = getRewardedAdUnitId();
    rewardedAd = RewardedAd.createForAdRequest(unitId);

    rewardedAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Rewarded ad loaded");
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, async (error) => {
      await errorLogger.logError(error, {
        action: "loadRewardedAd",
        screen: "AdService",
      });
    });

    rewardedAd.load();
  } catch (error) {
    await errorLogger.logError(error, {
      action: "loadRewardedAd",
      screen: "AdService",
    });
  }
};

export const showRewardedAd = async (
  onReward?: (rewardAmount: number, rewardType: string) => void
): Promise<void> => {
  try {
    if (rewardedAd?.loaded) {
      rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          onReward?.(reward.amount, reward.type);
        }
      );

      await rewardedAd.show();
      // Reload for next time
      await loadRewardedAd();
    }
  } catch (error) {
    await errorLogger.logError(error, {
      action: "showRewardedAd",
      screen: "AdService",
    });
  }
};

export const getAppOpenAdUnitId = (): string => {
  return __DEV__ ? TestIds.APP_OPEN : APP_OPEN_AD_UNIT_ID || "";
};

export const getBannerAdUnitId = (): string => {
  return __DEV__ ? TestIds.ADAPTIVE_BANNER : BANNER_AD_UNIT_ID || "";
};

export const getInterstitialAdUnitId = (): string => {
  return __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID || "";
};

export const getRewardedAdUnitId = (): string => {
  return __DEV__ ? TestIds.REWARDED : REWARDED_AD_UNIT_ID || "";
};
