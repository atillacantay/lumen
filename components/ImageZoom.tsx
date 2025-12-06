import { BorderRadius, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageZoomProps {
  imageUrl: string;
  imageStyle?: object;
}

export function ImageZoom({ imageUrl, imageStyle }: ImageZoomProps) {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Thumbnail with zoom indicator */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
        style={styles.container}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[styles.thumbnail, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.zoomIndicator}>
          <Ionicons name="expand-outline" size={16} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Fullscreen Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Full Image */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  zoomIndicator: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: Spacing.sm,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
});
