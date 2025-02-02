import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  BackHandler,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { type Camera, CameraView, useCameraPermissions } from "expo-camera";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createPost } from "../../services/bsky.service";
import { CameraType } from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

export default function NewPost() {
  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>(CameraType.back);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<typeof Camera | null>(null);
  const router = useRouter();

  const resetState = () => {
    setImage(null);
    setCaption("");
    setIsPosting(false);
    setShowCamera(false);
  };

  useEffect(() => {
    router.setParams({ showCamera: showCamera.toString() });
  }, [showCamera]);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (caption || image) {
        e.preventDefault(); // Block immediate navigation

        Alert.alert(
          "Discard changes?",
          "You have unsaved changes. Are you sure you want to discard them?",
          [
            {
              text: "Don't leave",
              style: "cancel",
              onPress: () => {},
            },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                resetState();
                navigation.dispatch(e.data.action); // Proceed with navigation
              },
            },
          ],
        );
      }
    });

    return unsubscribe;
  }, [navigation, caption, image, resetState]); // Include all dependencies

  const handlePost = async () => {
    if (!caption) return;

    setIsPosting(true);
    try {
      const result = await createPost(caption, image || undefined);
      if (result) {
        resetState(); // Reset all state
        Alert.alert("Success", "Your post has been shared!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.", [
        {
          text: "OK",
        },
      ]);
    } finally {
      setIsPosting(false);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      "Choose Image",
      "Would you like to take a photo or choose from library?",
      [
        {
          text: "Take Photo",
          onPress: () => setShowCamera(true),
        },
        {
          text: "Choose from Library",
          onPress: pickFromLibrary,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (caption || image) {
          Alert.alert(
            "Discard changes?",
            "You have unsaved changes. Are you sure you want to discard them?",
            [
              {
                text: "Don't leave",
                style: "cancel",
                onPress: () => {},
              },
              {
                text: "Discard",
                style: "destructive",
                onPress: () => {
                  resetState();
                  navigation.dispatch({ type: "GO_BACK" });
                },
              },
            ],
          );
          return true; // Block default back behavior
        }
        return false; // Allow default back behavior
      },
    );

    return () => backHandler.remove();
  }, [caption, image]);

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

  const takePicture = async (camera: typeof Camera) => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setImage(photo.uri);
      setShowCamera(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.fullScreenContainer}>
        <CameraView
          style={styles.fullScreenCamera}
          facing={facing}
          ref={(ref) => {
            cameraRef.current = ref;
          }}
        >
          <View style={styles.cameraControlsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={() =>
                setFacing(
                  facing === CameraType.back
                    ? CameraType.front
                    : CameraType.back,
                )
              }
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => takePicture(cameraRef.current)}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imagePickerContainer}
        onPress={pickImage}
        disabled={isPosting}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color="#666" />
            <Text style={styles.placeholderText}>Tap to select an image</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={300}
          editable={!isPosting}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!caption || isPosting) && styles.buttonDisabled,
          ]}
          onPress={handlePost}
          disabled={!caption || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Share Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 64,
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  fullScreenCamera: {
    flex: 1,
  },
  imagePickerContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#666",
    fontSize: 16,
  },
  form: {
    flex: 1,
    gap: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cameraView: {
    flex: 1,
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
  },
  cameraControlsContainer: {
    position: "absolute",
    top: 60,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  flipButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captureButtonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
