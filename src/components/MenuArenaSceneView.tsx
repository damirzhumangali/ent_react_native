import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface MenuArenaSceneViewProps {
  wallpaperId: string;
}

export default function MenuArenaSceneView({ wallpaperId }: MenuArenaSceneViewProps) {
  const webViewRef = useRef<WebView>(null);

  // Send message to WebView when wallpaperId changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: "SET_WALLPAPER", wallpaperId }));
    }
  }, [wallpaperId]);

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
            background: #000;
          }
          canvas {
            display: block;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
          }
        </style>
      </head>
      <body>
        <canvas id="gameCanvas"></canvas>
        <script>
          const canvas = document.getElementById("gameCanvas");
          const ctx = canvas.getContext("2d");

          let wallpaperId = "${wallpaperId}";
          let width = 120;
          let height = 240;
          let frame = 0;

          // Setup sizing
          function resize() {
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingEnabled = false;
          }
          resize();

          // Receive wallpaper updates from React Native
          document.addEventListener("message", function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "SET_WALLPAPER") {
                wallpaperId = data.wallpaperId;
              }
            } catch(e) {}
          });

          // Retro stars positions
          const starPositions = [
            {x: 70, y: 25, offset: 0}, {x: 88, y: 48, offset: 1}, 
            {x: 95, y: 15, offset: 2}, {x: 108, y: 33, offset: 0}, 
            {x: 114, y: 18, offset: 1}, {x: 92, y: 58, offset: 2}, 
            {x: 105, y: 72, offset: 0}, {x: 82, y: 85, offset: 1}, 
            {x: 116, y: 88, offset: 2}, {x: 99, y: 102, offset: 0}
          ];

          // Distant mountains heights array
          const distantH = [
            150, 151, 151, 150, 149, 147, 145, 146, 148, 150, 151, 153, 155, 156, 155, 153,
            151, 149, 147, 144, 142, 143, 145, 148, 150, 152, 154, 155, 156, 157, 157, 156,
            154, 153, 152, 150, 148, 146, 144, 146, 148, 151, 153, 155, 157, 159, 160, 160,
            159, 158, 157, 155, 153, 152, 150, 149, 147, 145, 146, 148, 150, 152, 153, 154,
            155, 155, 154, 152, 151, 150, 148, 147, 145, 143, 144, 146, 148, 150, 152, 154,
            156, 157, 157, 156, 154, 153, 151, 150, 148, 147, 145, 144, 146, 148, 150, 152,
            154, 156, 157, 158, 158, 157, 155, 154, 152, 151, 149, 147, 145, 146, 148, 150,
            152, 154, 155, 156, 156, 155, 153, 152, 150, 148, 146, 147, 149, 151, 153, 155
          ];

          // Near hills heights array
          const nearH = [
            177, 178, 178, 177, 175, 173, 172, 174, 176, 179, 181, 182, 183, 182, 180, 178,
            176, 174, 171, 168, 166, 167, 170, 173, 175, 178, 180, 181, 182, 181, 179, 177,
            176, 174, 172, 170, 168, 166, 167, 170, 173, 176, 178, 180, 181, 180, 178, 176,
            174, 173, 171, 169, 167, 165, 166, 168, 171, 174, 176, 178, 180, 181, 180, 178
          ];

          // Render loop at 10 FPS matching Swift's Timer
          setInterval(() => {
            frame = (frame + 1) % 1200;

            // Setup colors based on wallpaper
            let colors = {};
            switch (wallpaperId) {
              case "neon":
                colors = {
                  skyL: "#ff3296", skyR: "#1e0537", mount: "#380c40", hill: "#22062a",
                  tower: "#3c1450", towerH: "#5a2378", flag: "#ff007f", roof: "#b31e2c"
                };
                break;
              case "emerald":
                colors = {
                  skyL: "#50f0a0", skyR: "#0a2d23", mount: "#0a2823", hill: "#061914",
                  tower: "#0f322d", towerH: "#195046", flag: "#00ff88", roof: "#b31e2c"
                };
                break;
              case "volcano":
                colors = {
                  skyL: "#ff8c00", skyR: "#232323", mount: "#280808", hill: "#190505",
                  tower: "#2d0f0f", towerH: "#4b1919", flag: "#ff3700", roof: "#b31e2c"
                };
                break;
              case "battle":
                colors = {
                  skyL: "#ff5a1e", skyR: "#28144b", mount: "#1c0f26", hill: "#0e0816",
                  tower: "#242a44", towerH: "#3e486e", flag: "#1a8aff", roof: "#b31e2c"
                };
                break;
              default: // cosmic / default
                colors = {
                  skyL: "#00dcff", skyR: "#0f1430", mount: "#121930", hill: "#0c1022",
                  tower: "#203a60", towerH: "#3a5c8c", flag: "#00aaff", roof: "#b31e2c"
                };
            }

            // 1. Draw Sky Gradient
            const skyGrad = ctx.createLinearGradient(0, 0, width, 0);
            skyGrad.addColorStop(0, colors.skyL);
            skyGrad.addColorStop(1, colors.skyR);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, 135);

            // Fill lower part with sky background color temporarily
            ctx.fillStyle = colors.skyR;
            ctx.fillRect(0, 135, width, height - 135);

            // 2. Draw Twinkling Stars
            starPositions.forEach(star => {
              const phase = (frame + star.offset * 4) % 12;
              const opacity = phase < 4 ? 0.3 : (phase < 8 ? 1.0 : 0.6);
              ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
              ctx.fillRect(star.x, star.y, 1, 1);
              if (opacity === 1.0 && star.x % 4 === 0) {
                ctx.fillStyle = "rgba(150, 230, 255, 0.35)";
                ctx.fillRect(star.x - 1, star.y, 3, 1);
                ctx.fillRect(star.x, star.y - 1, 1, 3);
              }
            });

            // 3. Draw Pixel Moon
            const moonX = 94;
            const moonY = 35;
            ctx.fillStyle = "#fcf2d1";
            const moonOffset = [
              [0, -3], [1, -3], [2, -3],
              [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2],
              [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1],
              [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
              [-2, 1], [-1, 1], [0, 1], [1, 1],
              [-1, 2], [0, 2], [1, 2],
              [0, 3], [1, 3]
            ];
            moonOffset.forEach(p => {
              ctx.fillRect(moonX + p[0], moonY + p[1], 1, 1);
            });

            // Moon shadow overlay
            const moonShadow = [
              [2, -3], [3, -3], [4, -3],
              [1, -2], [2, -2], [3, -2], [4, -2],
              [0, -1], [1, -1], [2, -1], [3, -1], [4, -1],
              [0, 0], [1, 0], [2, 0], [3, 0],
              [0, 1], [1, 1], [2, 1],
              [1, 2], [2, 2], [3, 2],
              [2, 3], [3, 3]
            ];
            moonShadow.forEach(p => {
              const sy = moonY + p[1];
              const pct = sy / height;
              // Mix colors for shadow
              ctx.fillStyle = colors.skyR;
              ctx.fillRect(moonX + p[0], sy, 1, 1);
            });

            // 4. Draw Floating Clouds
            const cloudSpeed = 0.08;
            const cloudX1 = Math.floor(frame * cloudSpeed) % (width + 40) - 20;
            const cloudX2 = Math.floor(frame * (cloudSpeed * 0.7) + 60) % (width + 50) - 30;

            function drawCloud(cx, cy) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
              const blocks = [
                [0, 0, 14, 2],
                [2, -1, 10, 1],
                [4, -2, 6, 1],
                [-2, 1, 18, 1]
              ];
              blocks.forEach(b => {
                ctx.fillRect(cx + b[0], cy + b[1], b[2], b[3]);
              });
            }
            drawCloud(cloudX1, 55);
            drawCloud(cloudX2, 85);

            // 5. Draw Distant Mountains
            ctx.fillStyle = colors.mount;
            for (let x = 0; x < width; x++) {
              const index = Math.floor((x / width) * distantH.length);
              const h = distantH[Math.min(index, distantH.length - 1)];
              ctx.fillRect(x, h, 1, height - h);
            }

            // 6. Draw Near Hills
            ctx.fillStyle = colors.hill;
            for (let x = 0; x < width; x++) {
              const index = Math.floor((x / width) * nearH.length);
              const h = nearH[Math.min(index, nearH.length - 1)];
              ctx.fillRect(x, h, 1, height - h);
            }

            // 7. Draw Central Castle (x = 44 to 76, y = 160 to 240)
            const tx = 44;
            const ty = 160;
            const tw = 32;
            const th = 80;

            // Draw castle background shadow
            ctx.fillStyle = "#080c1a";
            ctx.fillRect(tx - 14, ty + 12, tw + 28, th);

            // --- CENTRAL TOWER ---
            ctx.fillStyle = colors.tower;
            ctx.fillRect(tx, ty, tw, th);
            //中央塔のライティング
            ctx.fillStyle = colors.towerH;
            ctx.fillRect(tx, ty, tw / 2, th);

            // Bricks overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            for (let row = 0; row < 12; row++) {
              const ry = ty + 6 + row * 6;
              ctx.fillRect(tx, ry, tw, 1);
              const offset = (row % 2) * 4;
              for (let brick = 0; brick < 4; brick++) {
                const bx = tx + brick * 8 + offset;
                if (bx < tx + tw) {
                  ctx.fillRect(bx, ry, 1, 6);
                }
              }
            }

            // Tower battlements (teeth)
            ctx.fillStyle = colors.towerH;
            for (let i = 0; i < 4; i++) {
              ctx.fillRect(tx + i * 8, ty - 4, 4, 4);
            }
            ctx.fillStyle = colors.tower;
            for (let i = 0; i < 4; i++) {
              ctx.fillRect(tx + i * 8 + 4, ty - 4, 4, 4);
            }

            // Central decoration line
            ctx.fillStyle = "#162640";
            ctx.fillRect(tx - 2, ty, tw + 4, 3);

            // --- LEFT TOWER ---
            ctx.fillStyle = colors.tower;
            ctx.fillRect(tx - 12, ty + 20, 10, 60);
            ctx.fillStyle = colors.towerH;
            ctx.fillRect(tx - 12, ty + 20, 4, 60);
            // Left roof (cone)
            ctx.fillStyle = colors.roof;
            for (let i = 0; i < 6; i++) {
              const rw = 2 + i * 2;
              ctx.fillRect((tx - 12) + 5 - i, ty + 14 + i, rw, 1);
            }

            // --- RIGHT TOWER ---
            ctx.fillStyle = colors.tower;
            ctx.fillRect(tx + tw + 2, ty + 20, 10, 60);
            ctx.fillStyle = colors.towerH;
            ctx.fillRect(tx + tw + 2, ty + 20, 4, 60);
            // Right roof (cone)
            ctx.fillStyle = colors.roof;
            for (let i = 0; i < 6; i++) {
              const rw = 2 + i * 2;
              ctx.fillRect((tx + tw + 2) + 5 - i, ty + 14 + i, rw, 1);
            }

            // Gates
            ctx.fillStyle = "#522e16";
            ctx.fillRect(tx + tw/2 - 5, height - 20, 10, 20);
            ctx.fillStyle = "#734826";
            ctx.fillRect(tx + tw/2 - 5, height - 20, 5, 20);
            // Gate arch
            ctx.fillStyle = "#162640";
            ctx.fillRect(tx + tw/2 - 6, height - 22, 12, 2);

            // Windows & glow
            const windowGlow = Math.floor(frame / 5) % 2 === 0;
            ctx.fillStyle = "#0c1022";
            ctx.fillRect(tx + 6, ty + 12, 4, 8);
            ctx.fillRect(tx + tw - 10, ty + 12, 4, 8);
            
            ctx.fillStyle = windowGlow ? "#ffb432" : "#d26e14";
            ctx.fillRect(tx + tw/2 - 2, ty + 32, 4, 8);

            // 8. Gold Crown on Tower
            ctx.fillStyle = "#fad219";
            const crown = [
              [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0],
              [-4, -1], [-3, -1], [3, -1], [4, -1],
              [-4, -2], [0, -2], [4, -2]
            ];
            crown.forEach(p => {
              ctx.fillRect(tx + tw/2 + p[0], ty + 8 + p[1], 1, 1);
            });

            // 9. Flagpole and waving flag
            const poleX = tx + tw/2 - 1;
            const poleY = ty - 22;
            ctx.fillStyle = "#d2d2d7";
            ctx.fillRect(poleX, poleY, 2, 18);
            ctx.fillStyle = "#fad219";
            ctx.fillRect(poleX - 1, poleY - 2, 4, 2);

            // Flag waving frame
            const flagFrame = Math.floor(frame / 3) % 3;
            ctx.fillStyle = colors.flag;
            let flagOffset = [];
            if (flagFrame === 0) {
              flagOffset = [
                [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
                [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
                [1, 3], [2, 3], [3, 3], [4, 3]
              ];
            } else if (flagFrame === 1) {
              flagOffset = [
                [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
                [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
                [1, 3], [2, 3], [3, 3], [4, 3]
              ];
            } else {
              flagOffset = [
                [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
                [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
                [1, 4], [2, 4], [3, 4], [4, 4]
              ];
            }
            flagOffset.forEach(p => {
              ctx.fillRect(poleX + 1 + p[0], poleY + (flagFrame === 2 ? 0 : 1) + p[1], 1, 1);
            });

            // 10. Torches
            function drawTorch(x, y) {
              ctx.fillStyle = "#4c4c4c";
              ctx.fillRect(x, y, 2, 3);
              const fireFrame = frame % 4;
              const fireColors = ["#ff4c00", "#ffb219", "#ff8000", "#ffcc32"];
              ctx.fillStyle = fireColors[fireFrame];
              if (fireFrame === 0) {
                ctx.fillRect(x, y - 2, 2, 2);
                ctx.fillRect(x + 1, y - 3, 1, 1);
              } else if (fireFrame === 1) {
                ctx.fillRect(x, y - 2, 2, 2);
                ctx.fillRect(x, y - 3, 1, 1);
              } else if (fireFrame === 2) {
                ctx.fillRect(x, y - 2, 2, 2);
                ctx.fillRect(x - 1, y - 3, 2, 1);
              } else {
                ctx.fillRect(x, y - 2, 2, 2);
                ctx.fillRect(x + 1, y - 4, 1, 2);
              }
            }
            drawTorch(tx + 3, ty + 18);
            drawTorch(tx + tw - 5, ty + 18);

            // 11. Animated Knight Hero (left) and Shadow Villain (right)
            const hx = 20;
            const hy = 186;
            
            // Cape waving
            const capeFrame = Math.floor(frame / 3) % 3;
            ctx.fillStyle = "#dc141e";
            if (capeFrame === 0) {
              ctx.fillRect(hx - 3, hy + 4, 2, 6);
              ctx.fillRect(hx - 4, hy + 5, 2, 4);
            } else if (capeFrame === 1) {
              ctx.fillRect(hx - 4, hy + 4, 3, 5);
              ctx.fillRect(hx - 5, hy + 6, 2, 3);
            } else {
              ctx.fillRect(hx - 3, hy + 5, 2, 5);
            }

            // Blue Knight armor
            ctx.fillStyle = "#1e6ede";
            ctx.fillRect(hx - 2, hy + 3, 4, 8); // body
            // Iron helmet
            ctx.fillStyle = "#8ca0be";
            ctx.fillRect(hx - 2, hy - 1, 4, 4);
            // Gold plume
            ctx.fillStyle = "#ffd700";
            ctx.fillRect(hx - 1, hy - 3, 1, 2);
            ctx.fillRect(hx, hy - 2, 1, 1);
            // Gold glowing visor
            ctx.fillStyle = "#ffe632";
            ctx.fillRect(hx, hy + 1, 2, 1);
            // Shield
            ctx.fillStyle = "#c8cdd7";
            ctx.fillRect(hx - 3, hy + 4, 2, 5);
            ctx.fillStyle = "#ffd700";
            ctx.fillRect(hx - 2, hy + 6, 1, 1); // shield cross

            // Sword animation
            const swordFrame = Math.floor(frame / 4) % 2;
            ctx.fillStyle = "#00e6ff";
            if (swordFrame === 0) {
              ctx.fillRect(hx + 2, hy + 2, 1, 1);
              ctx.fillRect(hx + 3, hy + 1, 1, 1);
              ctx.fillRect(hx + 4, hy, 1, 1);
              ctx.fillRect(hx + 5, hy - 1, 1, 1);
              ctx.fillStyle = "rgba(0, 230, 255, 0.35)";
              ctx.fillRect(hx + 4, hy - 2, 3, 3);
            } else {
              ctx.fillRect(hx + 2, hy + 4, 4, 1);
              ctx.fillRect(hx + 6, hy + 4, 1, 1);
              ctx.fillStyle = "rgba(0, 230, 255, 0.35)";
              ctx.fillRect(hx + 5, hy + 3, 3, 3);
            }

            // Shadow Villain (right)
            const vx = 100;
            const vy = 186;
            
            // Bat particle shadows
            const shadowFrame = frame % 4;
            ctx.fillStyle = "rgba(25, 10, 40, 0.7)";
            if (shadowFrame === 0) {
              ctx.fillRect(vx + 4, vy - 6, 2, 1);
              ctx.fillRect(vx - 5, vy - 2, 1, 1);
            } else if (shadowFrame === 1) {
              ctx.fillRect(vx + 3, vy - 7, 1, 2);
              ctx.fillRect(vx - 4, vy - 3, 2, 1);
            } else if (shadowFrame === 2) {
              ctx.fillRect(vx + 5, vy - 5, 2, 1);
              ctx.fillRect(vx - 6, vy - 1, 1, 1);
            } else {
              ctx.fillRect(vx + 2, vy - 8, 2, 1);
            }

            // Villain cloak
            ctx.fillStyle = "#190a28";
            ctx.fillRect(vx - 2, vy + 3, 5, 8);
            // Red hood
            ctx.fillStyle = "#640a14";
            ctx.fillRect(vx - 2, vy - 1, 5, 4);
            // Horns
            ctx.fillStyle = "#0f050f";
            ctx.fillRect(vx - 3, vy - 3, 1, 3);
            ctx.fillRect(vx + 3, vy - 3, 1, 3);
            // Red eyes
            ctx.fillStyle = "#ff1919";
            ctx.fillRect(vx - 1, vy + 1, 1, 1);
            ctx.fillRect(vx + 1, vy + 1, 1, 1);

            // Dark staff
            ctx.fillStyle = "#32190f";
            ctx.fillRect(vx - 4, vy + 2, 1, 9);
            // Pulsing blood crystal
            const crystalPulse = Math.floor(frame / 2) % 3;
            const crystalColors = ["#ff0032", "#ff6496", "#b40014"];
            ctx.fillStyle = crystalColors[crystalPulse];
            ctx.fillRect(vx - 5, vy - 1, 3, 3);
            ctx.fillStyle = "rgba(255, 0, 50, 0.3)";
            ctx.fillRect(vx - 6, vy - 2, 5, 5);

            // Combat projectile spell shootout
            const projRange = 72;
            const projCycle = 36;
            const projFrame = frame % projCycle;

            if (projFrame < projCycle * 0.75) {
              // Spell fly from villain to knight
              const progress = projFrame / (projCycle * 0.75);
              const px = (vx - 5) - progress * projRange;
              const py = (vy - 1) + Math.sin(progress * Math.PI) * -12;
              
              ctx.fillStyle = "#ff3296";
              ctx.fillRect(Math.floor(px), Math.floor(py), 3, 3);
              ctx.fillStyle = "rgba(255, 120, 220, 0.4)";
              ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, 5, 5);
            } else {
              // Shield blocking collision particle blast at hero
              const expProgress = (projFrame - projCycle * 0.75) / (projCycle * 0.25);
              const ex = hx - 3;
              const ey = hy + 6;
              ctx.fillStyle = "rgba(0, 230, 255, " + (1.0 - expProgress) + ")";
              ctx.fillRect(ex - Math.floor(expProgress * 5), ey - Math.floor(expProgress * 4), 1, 1);
              ctx.fillRect(ex - Math.floor(expProgress * 2), ey + Math.floor(expProgress * 5), 1, 1);
              ctx.fillRect(ex - Math.floor(expProgress * 4), ey - Math.floor(expProgress * 2), 1, 1);
              ctx.fillRect(ex - Math.floor(expProgress * 6), ey + Math.floor(expProgress * 1), 1, 1);
            }
          }, 100);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.webContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
