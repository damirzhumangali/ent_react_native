import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

interface Tower {
  id: string;
  type: "king" | "side";
  maxHp: number;
  hp: number;
  isShielded: boolean;
}

interface BattleArenaSceneViewProps {
  playerTowers: Tower[];
  enemyTowers: Tower[];
  isPlayerFrozen: boolean;
  isEnemyFrozen: boolean;
  activePlayerHeroId?: string | null;
  activeEnemyHeroId?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function BattleArenaSceneView({
  playerTowers,
  enemyTowers,
  isPlayerFrozen,
  isEnemyFrozen,
  activePlayerHeroId,
  activeEnemyHeroId
}: BattleArenaSceneViewProps) {
  const webViewRef = useRef<WebView>(null);

  // Send state updates to WebView
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "UPDATE_STATE",
          playerTowers,
          enemyTowers,
          isPlayerFrozen,
          isEnemyFrozen
        })
      );
    }
  }, [playerTowers, enemyTowers, isPlayerFrozen, isEnemyFrozen]);

  // Trigger ability animation in WebView
  useEffect(() => {
    if (activePlayerHeroId && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "TRIGGER_ABILITY",
          heroId: activePlayerHeroId,
          isEnemy: false
        })
      );
    }
  }, [activePlayerHeroId]);

  useEffect(() => {
    if (activeEnemyHeroId && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "TRIGGER_ABILITY",
          heroId: activeEnemyHeroId,
          isEnemy: true
        })
      );
    }
  }, [activeEnemyHeroId]);

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
            background: transparent;
          }
          canvas {
            display: block;
            width: 100%;
            height: 100%;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <canvas id="arenaCanvas"></canvas>
        <script>
          const canvas = document.getElementById("arenaCanvas");
          const ctx = canvas.getContext("2d");

          let width = window.innerWidth;
          let height = window.innerHeight;
          
          function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
          }
          window.addEventListener("resize", resize);
          resize();

          // Game state holder
          let playerTowers = [
            { hp: 300, maxHp: 300, isShielded: false },
            { hp: 500, maxHp: 500, isShielded: false },
            { hp: 300, maxHp: 300, isShielded: false }
          ];
          let enemyTowers = [
            { hp: 300, maxHp: 300, isShielded: false },
            { hp: 500, maxHp: 500, isShielded: false },
            { hp: 300, maxHp: 300, isShielded: false }
          ];
          let isPlayerFrozen = false;
          let isEnemyFrozen = false;

          // Animations and particles arrays
          let projectiles = [];
          let particles = [];
          let screenShake = 0;
          let frame = 0;

          // Event receiver
          document.addEventListener("message", function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "UPDATE_STATE") {
                playerTowers = data.playerTowers;
                enemyTowers = data.enemyTowers;
                isPlayerFrozen = data.isPlayerFrozen;
                isEnemyFrozen = data.isEnemyFrozen;
              } else if (data.type === "TRIGGER_ABILITY") {
                spawnAbilityProjectiles(data.heroId, data.isEnemy);
              }
            } catch(e) {}
          });

          // Helper to get target index
          function getTargetTowerIndex(isEnemyTarget) {
            const towers = isEnemyTarget ? enemyTowers : playerTowers;
            if (towers[0].hp > 0) return 0;
            if (towers[2].hp > 0) return 2;
            if (towers[1].hp > 0) return 1;
            return -1;
          }

          function spawnAbilityProjectiles(heroId, isEnemy) {
            const startX = width / 2;
            const startY = isEnemy ? height * 0.25 : height * 0.65;

            // Target towers
            const targetIsEnemy = !isEnemy;
            const targetTowers = targetIsEnemy ? enemyTowers : playerTowers;

            // Math ability shoots at ALL towers
            if (heroId === "math") {
              [0, 1, 2].forEach(idx => {
                if (targetTowers[idx].hp > 0) {
                  const targetPos = getTowerPos(idx, targetIsEnemy);
                  spawnProjectile(startX, startY, targetPos.x, targetPos.y, "#00e5ff", 2.5);
                }
              });
              screenShake = 6;
              return;
            }

            // Chemical ability shoots a green toxic blob
            let color = "#00E87A";
            let size = 2.0;

            if (heroId === "physics") {
              color = "#ffd700"; // yellow critical bolt
              size = 3.5;
            } else if (heroId === "chemistry") {
              color = "#c084fc"; // purple chemical acid
              size = 2.5;
            } else if (heroId === "geography") {
              screenShake = 15; // massive earthquake
              generateEarthquakeBlast();
              return;
            } else if (heroId === "biology") {
              // heal effect
              spawnHealParticles(isEnemy);
              return;
            }

            const targetIdx = getTargetTowerIndex(targetIsEnemy);
            if (targetIdx !== -1) {
              const targetPos = getTowerPos(targetIdx, targetIsEnemy);
              spawnProjectile(startX, startY, targetPos.x, targetPos.y, color, size);
            }
          }

          function getTowerPos(index, isEnemy) {
            const rowY = isEnemy ? height * 0.18 : height * 0.70;
            const kingY = isEnemy ? height * 0.10 : height * 0.80;

            if (index === 0) return { x: width * 0.20, y: rowY }; // Left
            if (index === 1) return { x: width * 0.50, y: kingY }; // King
            if (index === 2) return { x: width * 0.80, y: rowY }; // Right
            return { x: width / 2, y: height / 2 };
          }

          function spawnProjectile(sx, sy, tx, ty, color, size) {
            projectiles.push({
              sx, sy, tx, ty,
              cx: sx, cy: sy,
              progress: 0,
              speed: 0.04,
              color,
              size
            });
          }

          function spawnHealParticles(isEnemy) {
            const targetTowers = isEnemy ? enemyTowers : playerTowers;
            let lowestIdx = -1;
            let lowestHp = 9999;
            targetTowers.forEach((t, i) => {
              if (t.hp > 0 && t.hp < lowestHp) {
                lowestHp = t.hp;
                lowestIdx = i;
              }
            });
            if (lowestIdx !== -1) {
              const pos = getTowerPos(lowestIdx, isEnemy);
              for (let i = 0; i < 20; i++) {
                particles.push({
                  x: pos.x + (Math.random() - 0.5) * 40,
                  y: pos.y + (Math.random() - 0.5) * 40,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -Math.random() * 2 - 1,
                  color: "#00E87A",
                  life: 1.0,
                  decay: 0.03
                });
              }
            }
          }

          function generateEarthquakeBlast() {
            for (let i = 0; i < 40; i++) {
              particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: (Math.random() - 0.5) * 1.5,
                color: "#78350f", // brown mud particles
                life: 1.0,
                decay: 0.04,
                size: Math.random() * 3 + 2
              });
            }
          }

          function spawnExplosion(x, y, color) {
            for (let i = 0; i < 15; i++) {
              particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: color || "#ff4500",
                life: 1.0,
                decay: 0.05,
                size: Math.random() * 2 + 1.5
              });
            }
          }

          // Game loop
          function loop() {
            frame++;
            ctx.clearRect(0, 0, width, height);

            ctx.save();
            if (screenShake > 0) {
              const dx = (Math.random() - 0.5) * screenShake;
              const dy = (Math.random() - 0.5) * screenShake;
              ctx.translate(dx, dy);
              screenShake *= 0.9;
              if (screenShake < 0.2) screenShake = 0;
            }

            // 1. Draw River & Bridge in Center
            const riverY = height * 0.44;
            const riverH = height * 0.08;
            ctx.fillStyle = "#1e3a8a"; // deep blue
            ctx.fillRect(0, riverY, width, riverH);
            
            // Bridge
            ctx.fillStyle = "#78350f"; // wood bridge
            ctx.fillRect(width * 0.25, riverY - 4, width * 0.15, riverH + 8);
            ctx.fillRect(width * 0.60, riverY - 4, width * 0.15, riverH + 8);

            // 2. Draw Towers
            // Enemy (Top)
            enemyTowers.forEach((tower, idx) => {
              const pos = getTowerPos(idx, true);
              drawTowerNode(pos.x, pos.y, tower, true);
            });

            // Player (Bottom)
            playerTowers.forEach((tower, idx) => {
              const pos = getTowerPos(idx, false);
              drawTowerNode(pos.x, pos.y, tower, false);
            });

            // 3. Update & Draw Projectiles
            projectiles.forEach((proj, idx) => {
              proj.progress += proj.speed;
              
              // Parabola math
              const dx = proj.tx - proj.sx;
              const dy = proj.ty - proj.sy;
              proj.cx = proj.sx + dx * proj.progress;
              // Add arc height
              const arc = -50 * Math.sin(proj.progress * Math.PI);
              proj.cy = proj.sy + dy * proj.progress + arc;

              // Draw projectile
              ctx.fillStyle = proj.color;
              ctx.beginPath();
              ctx.arc(proj.cx, proj.cy, proj.size * 3, 0, Math.PI * 2);
              ctx.fill();

              // Add tail spark particles
              if (frame % 2 === 0) {
                particles.push({
                  x: proj.cx,
                  y: proj.cy,
                  vx: (Math.random() - 0.5) * 1,
                  vy: (Math.random() - 0.5) * 1,
                  color: proj.color,
                  life: 0.6,
                  decay: 0.05,
                  size: proj.size
                });
              }

              if (proj.progress >= 1.0) {
                spawnExplosion(proj.tx, proj.ty, proj.color);
                projectiles.splice(idx, 1);
              }
            });

            // 4. Update & Draw Particles
            particles.forEach((p, idx) => {
              p.x += p.vx;
              p.y += p.vy;
              p.life -= p.decay;

              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.life;
              ctx.beginPath();
              ctx.arc(p.x, p.y, (p.size || 2) * p.life, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;

              if (p.life <= 0) {
                particles.splice(idx, 1);
              }
            });

            ctx.restore();
            requestAnimationFrame(loop);
          }

          function drawTowerNode(x, y, tower, isEnemy) {
            if (tower.hp <= 0) {
              // Draw ruined tower
              ctx.fillStyle = "#334155";
              ctx.fillRect(x - 20, y - 5, 40, 10);
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(x - 12, y - 10, 24, 8);
              return;
            }

            const teamColor = isEnemy ? "#FF3B30" : "#00E87A";
            const sideSize = tower.type === "king" ? 32 : 24;
            const towerHeight = tower.type === "king" ? 50 : 38;

            // Draw castle tower block
            ctx.fillStyle = "#475569"; // slate stones
            ctx.fillRect(x - sideSize/2, y - towerHeight, sideSize, towerHeight);

            // Roof Tiles
            ctx.fillStyle = isEnemy ? "#b91c1c" : "#1d4ed8";
            ctx.beginPath();
            ctx.moveTo(x - sideSize/2 - 4, y - towerHeight);
            ctx.lineTo(x + sideSize/2 + 4, y - towerHeight);
            ctx.lineTo(x, y - towerHeight - 14);
            ctx.closePath();
            ctx.fill();

            // Shield
            if (tower.isShielded) {
              ctx.strokeStyle = "#00e5ff";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(x, y - towerHeight/2, sideSize * 0.95, 0, Math.PI*2);
              ctx.stroke();
              // inner blue glow
              ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
              ctx.beginPath();
              ctx.arc(x, y - towerHeight/2, sideSize * 0.95, 0, Math.PI*2);
              ctx.fill();
            }

            // Freeze layer overlay
            const frozenSide = isEnemy ? isEnemyFrozen : isPlayerFrozen;
            if (frozenSide) {
              ctx.fillStyle = "rgba(0, 229, 255, 0.28)";
              ctx.fillRect(x - sideSize/2 - 2, y - towerHeight - 12, sideSize + 4, towerHeight + 14);
              ctx.strokeStyle = "#e0f7fa";
              ctx.lineWidth = 1;
              ctx.strokeRect(x - sideSize/2 - 2, y - towerHeight - 12, sideSize + 4, towerHeight + 14);
            }
          }

          // Start loop
          requestAnimationFrame(loop);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
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
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
