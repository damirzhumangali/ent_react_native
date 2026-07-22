import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { SLIDER_SKEUOMORPHIC_B64 } from "@/constants/RiveBase64";

export default function RiveLoadingAnimation() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #040612;
          }
          canvas {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
        <script src="https://unpkg.com/@rive-app/canvas@2.24.0"></script>
      </head>
      <body>
        <canvas id="canvas"></canvas>
        <script>
          try {
            const base64Data = "${SLIDER_SKEUOMORPHIC_B64}";
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const r = new rive.Rive({
              buffer: bytes.buffer,
              canvas: document.getElementById("canvas"),
              autoplay: true,
              fit: rive.Fit.Cover,
              alignment: rive.Alignment.Center,
              onLoad: () => {
                r.resizeDrawingSurfaceToCanvas();
              }
            });
            window.addEventListener('resize', () => {
              r.resizeDrawingSurfaceToCanvas();
            });
          } catch (e) {
            console.error("Rive load error:", e);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {
    backgroundColor: "#040612",
    flex: 1,
  },
});
