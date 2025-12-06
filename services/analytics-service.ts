import { customEvent } from "vexo-analytics";

const logAnalyticsEvent = (eventName: string, params?: Record<string, any>) => {
  customEvent(eventName, params || {});
};

// Track screen/page views
export const trackScreenView = (
  screenName: string,
  params?: Record<string, any>
) => {
  logAnalyticsEvent("screen_view", { screen_name: screenName, ...params });
};

// Track feed opened
export const trackFeedOpened = (params?: {
  sortBy?: string;
  timeRange?: string;
  categoryId?: string;
}) => {
  logAnalyticsEvent("feed_opened", {
    sort_by: params?.sortBy || "newest",
    time_range: params?.timeRange || "all",
    category_id: params?.categoryId || "all",
  });
};

// Track post viewed
export const trackPostViewed = (params: {
  postId: string;
  authorId: string;
  category: string;
  duration?: number;
}) => {
  logAnalyticsEvent("post_viewed", {
    post_id: params.postId,
    author_id: params.authorId,
    category: params.category,
    duration_ms: params.duration || 0,
  });
};

// Track post created
export const trackPostCreated = (params: {
  postId: string;
  category: string;
  hasImage: boolean;
  contentLength: number;
}) => {
  logAnalyticsEvent("post_created", {
    post_id: params.postId,
    category: params.category,
    has_image: params.hasImage,
    content_length: params.contentLength,
  });
};

// Track post hugged
export const trackPostHugged = (params: {
  postId: string;
  authorId: string;
  category: string;
}) => {
  logAnalyticsEvent("post_hugged", {
    post_id: params.postId,
    author_id: params.authorId,
    category: params.category,
  });
};

// Track post shared
export const trackPostShared = (params: {
  postId: string;
  category: string;
  platform?: string;
}) => {
  logAnalyticsEvent("post_shared", {
    post_id: params.postId,
    category: params.category,
    platform: params.platform || "unknown",
  });
};

// Track comment created
export const trackCommentCreated = (params: {
  commentId: string;
  postId: string;
  contentLength: number;
}) => {
  logAnalyticsEvent("comment_created", {
    comment_id: params.commentId,
    post_id: params.postId,
    content_length: params.contentLength,
  });
};

// Track comment hugged
export const trackCommentHugged = (params: {
  commentId: string;
  postId: string;
}) => {
  logAnalyticsEvent("comment_hugged", {
    comment_id: params.commentId,
    post_id: params.postId,
  });
};

// Track category filtered
export const trackCategoryFiltered = (params: {
  categoryId: string;
  categoryName: string;
  postsCount?: number;
}) => {
  logAnalyticsEvent("category_filtered", {
    category_id: params.categoryId,
    category_name: params.categoryName,
    posts_count: params.postsCount || 0,
  });
};

// Track sort changed
export const trackSortChanged = (params: {
  newSort: string;
  previousSort?: string;
  screen: string;
}) => {
  logAnalyticsEvent("sort_changed", {
    new_sort: params.newSort,
    previous_sort: params.previousSort || "unknown",
    screen: params.screen,
  });
};

// Track search performed
export const trackSearchPerformed = (params: {
  query: string;
  resultsCount: number;
  category?: string;
}) => {
  logAnalyticsEvent("search_performed", {
    query: params.query,
    results_count: params.resultsCount,
    category: params.category || "all",
  });
};

// Track search result clicked
export const trackSearchResultClicked = (params: {
  query: string;
  position: number;
  postId: string;
  category: string;
}) => {
  logAnalyticsEvent("search_result_clicked", {
    query: params.query,
    position: params.position,
    post_id: params.postId,
    category: params.category,
  });
};

// Track pull to refresh
export const trackPullToRefresh = (screen: string) => {
  logAnalyticsEvent("pull_to_refresh", { screen });
};

// Track ad impression
export const trackAdImpression = (params: {
  adType: "banner" | "interstitial" | "rewarded" | "native";
  position: string;
  network: string;
}) => {
  logAnalyticsEvent("ad_impression", {
    ad_type: params.adType,
    position: params.position,
    network: params.network,
  });
};

// Track ad clicked
export const trackAdClicked = (params: {
  adType: "banner" | "interstitial" | "rewarded" | "native";
  network: string;
}) => {
  logAnalyticsEvent("ad_clicked", {
    ad_type: params.adType,
    network: params.network,
  });
};

// Set user properties
export const setAnalyticsUserProperties = (params: {
  userId?: string;
  userType?: "creator" | "consumer" | "anonymous";
  registeredAt?: Date;
  region?: string;
}) => {
  logAnalyticsEvent("set_user_properties", {
    user_id: params.userId,
    user_type: params.userType || "anonymous",
    region: params.region || "unknown",
  });
};

// Track session start
export const trackSessionStart = () => {
  logAnalyticsEvent("session_start", {});
};

// Track session end
export const trackSessionEnd = (sessionDurationMs: number) => {
  logAnalyticsEvent("session_end", { session_duration_ms: sessionDurationMs });
};

// Track app opened
export const trackAppOpened = (params?: { source?: string }) => {
  logAnalyticsEvent("app_open", { source: params?.source || "direct" });
};

// Track error (for analytics, not crashlytics)
export const trackAnalyticsError = (params: {
  errorName: string;
  errorMessage: string;
  screen: string;
}) => {
  logAnalyticsEvent("app_error", {
    error_name: params.errorName,
    error_message: params.errorMessage,
    screen: params.screen,
  });
};
