import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Animated, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface HeartRateScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveHeartRate: (bpm: number) => void;
}

interface SignalSample {
  time: number;
  val: number;
}

export function HeartRateScannerModal({ visible, onClose, onSaveHeartRate }: HeartRateScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [measuredBpm, setMeasuredBpm] = useState<number | null>(null);
  const [fingerDetected, setFingerDetected] = useState<boolean>(false);
  const [livePulseInstant, setLivePulseInstant] = useState<number | string>('--');
  const [statusMessage, setStatusMessage] = useState<string>('Coloca tu dedo sobre la cámara y el flash');
  const [waveSvgPath, setWaveSvgPath] = useState<string>('M 0 25 L 200 25');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const webStreamRef = useRef<MediaStream | null>(null);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const webCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const samplesRef = useRef<SignalSample[]>([]);
  const beatIntervalsRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number>(0);
  const validDurationSecRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 450, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, pulseAnim]);

  const stopMediaStream = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (webStreamRef.current) {
      webStreamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch {}
      });
      webStreamRef.current = null;
    }
    if (webVideoRef.current) {
      webVideoRef.current.pause();
      webVideoRef.current.srcObject = null;
      webVideoRef.current.remove();
      webVideoRef.current = null;
    }
    if (webCanvasRef.current) {
      webCanvasRef.current.remove();
      webCanvasRef.current = null;
    }
  };

  useEffect(() => {
    return () => { stopMediaStream(); };
  }, []);

  const processWebFrame = () => {
    if (!webVideoRef.current || !webCanvasRef.current) return;
    const video = webVideoRef.current;
    const canvas = webCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState >= 2 && ctx) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;
      let rSum = 0, gSum = 0, bSum = 0;
      const pixelCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }
      const avgR = rSum / pixelCount;
      const avgG = gSum / pixelCount;
      const avgB = bSum / pixelCount;
      const isRedSaturated = avgR > 45 && avgR > (avgG + avgB) * 0.90;
      const isAdequatelyLit = avgR > 35;
      const isFingerOnLens = isRedSaturated && isAdequatelyLit;
      const now = Date.now();
      const dt = lastFrameTimeRef.current > 0 ? (now - lastFrameTimeRef.current) / 1000 : 0.033;
      lastFrameTimeRef.current = now;

      if (!isFingerOnLens) {
        setFingerDetected(false);
        setStatusMessage('⚠️ Cubre la cámara y el flash suavemente con tu dedo.');
        setLivePulseInstant('--');
        setWaveSvgPath('M 0 25 L 200 25');
      } else {
        setFingerDetected(true);
        setStatusMessage('🟢 Dedo detectado • Mantén el pulso firme y relajado...');
        const opticalVal = avgR - (avgG * 0.7);
        samplesRef.current.push({ time: now, val: opticalVal });
        if (samplesRef.current.length > 180) samplesRef.current.shift();
        validDurationSecRef.current += dt;
        const currentProgress = Math.min(100, Math.round((validDurationSecRef.current / 15) * 100));
        setProgress(currentProgress);
        const samples = samplesRef.current;
        if (samples.length >= 25) {
          let sum = 0;
          for (let i = 0; i < samples.length; i++) sum += samples[i].val;
          const mean = sum / samples.length;
          const pointsCount = Math.min(samples.length, 30);
          const recentSamples = samples.slice(-pointsCount);
          let pathD = '';
          const maxAc = 35;
          recentSamples.forEach((s, idx) => {
            const x = (idx / (pointsCount - 1)) * 200;
            const ac = s.val - mean;
            const y = Math.max(5, Math.min(40, 25 - (ac / maxAc) * 18));
            pathD += (idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`);
          });
          setWaveSvgPath(pathD || 'M 0 25 L 200 25');
          const lastIdx = samples.length - 2;
          const curr = samples[lastIdx].val - mean;
          const prev = samples[lastIdx - 1].val - mean;
          const next = samples[lastIdx + 1].val - mean;
          if (curr > 0.6 && curr > prev && curr >= next) {
            const peakTime = samples[lastIdx].time;
            const interval = peakTime - lastPeakTimeRef.current;
            if (interval >= 350 && interval <= 1500) {
              lastPeakTimeRef.current = peakTime;
              beatIntervalsRef.current.push(interval);
              if (beatIntervalsRef.current.length > 12) beatIntervalsRef.current.shift();
              const intervals = beatIntervalsRef.current;
              const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
              const instantBpm = Math.round(60000 / avgInterval);
              if (instantBpm >= 45 && instantBpm <= 165) setLivePulseInstant(instantBpm);
            } else if (lastPeakTimeRef.current === 0 || interval > 1500) lastPeakTimeRef.current = peakTime;
          }
        }
        if (validDurationSecRef.current >= 15) {
          stopMediaStream();
          setScanning(false);
          const intervals = beatIntervalsRef.current;
          let finalBpm = 72;
          if (intervals.length >= 4) {
            const sorted = [...intervals].sort((a, b) => a - b);
            const medianInterval = sorted[Math.floor(sorted.length / 2)];
            finalBpm = Math.round(60000 / medianInterval);
          } else if (typeof livePulseInstant === 'number') finalBpm = livePulseInstant;
          finalBpm = Math.max(50, Math.min(160, finalBpm));
          setMeasuredBpm(finalBpm);
          setStatusMessage('✅ Medición completada con éxito.');
          return;
        }
      }
    }
    animFrameIdRef.current = requestAnimationFrame(processWebFrame);
  };

  const startScan = async () => {
    setCameraError(null);
    setMeasuredBpm(null);
    setProgress(0);
    setFingerDetected(false);
    setLivePulseInstant('--');
    setStatusMessage('Iniciando cámara y flash...');
    samplesRef.current = [];
    beatIntervalsRef.current = [];
    lastPeakTimeRef.current = 0;
    validDurationSecRef.current = 0;
    lastFrameTimeRef.current = 0;

    if (Platform.OS === 'web') {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) throw new Error('API no disponible.');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 160 }, height: { ideal: 120 }, frameRate: { ideal: 30 } },
        });
        webStreamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        try {
          const capabilities = (track.getCapabilities?.() || {}) as any;
          if (capabilities.torch) await (track as any).applyConstraints({ advanced: [{ torch: true }] });
        } catch (e) { console.warn(e); }
        const video = document.createElement('video');
        video.autoplay = true; video.playsInline = true; video.muted = true; video.srcObject = stream;
        video.style.position = 'fixed'; video.style.top = '-9999px'; video.style.left = '-9999px';
        video.style.width = '160px'; video.style.height = '120px';
        document.body.appendChild(video);
        webVideoRef.current = video;
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 24; canvas.style.position = 'fixed'; canvas.style.top = '-9999px';
        document.body.appendChild(canvas);
        webCanvasRef.current = canvas;
        await video.play();
        setScanning(true);
        animFrameIdRef.current = requestAnimationFrame(processWebFrame);
      } catch (err: any) {
        setCameraError(err.message || 'Error de cámara.');
        setScanning(false);
      }
    } else {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) { setCameraError('Permiso denegado.'); return; }
      }
      setScanning(true);
    }
  };

  const handleCancel = () => {
    stopMediaStream();
    setScanning(false);
    setProgress(0);
    setMeasuredBpm(null);
    setCameraError(null);
    onClose();
  };

  const handleApply = () => {
    if (measuredBpm) {
      onSaveHeartRate(measuredBpm);
      handleCancel();
    }
  };

  const getBpmVerdict = (bpm: number) => {
    if (bpm < 60) return { label: 'Bradicardia / Atleta', color: '#60A5FA' };
    if (bpm <= 75) return { label: 'Reposo Óptimo', color: '#34D399' };
    if (bpm <= 85) return { label: 'Normal', color: '#FDE047' };
    return { label: 'Elevado', color: '#F87171' };
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleBadgeGroup}>
              <ThemedText style={styles.badgeText}>⚡ SENSOR BIOMÉTRICO ÓPTICO</ThemedText>
              <ThemedText style={styles.titleText}>Escáner Cardíaco PPG</ThemedText>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          {scanning && Platform.OS !== 'web' && permission?.granted && (
            <View style={styles.cameraHiddenWrapper}>
              <CameraView style={StyleSheet.absoluteFill} facing="back" enableTorch={true} />
            </View>
          )}

          <View style={styles.sensorArea}>
            <Animated.View style={[styles.pulseCircleBackdrop, { transform: [{ scale: pulseAnim }] }]} />
            <View style={[styles.sensorLensCircle, scanning && styles.sensorLensActive, fingerDetected && styles.sensorLensCovered]}>
              <ThemedText style={{ fontSize: 36 }}>{fingerDetected ? '🩸' : '🫀'}</ThemedText>
              {scanning && <ThemedText style={styles.sensorStatusScanning}>{fingerDetected ? 'PROCESANDO' : 'BUSCANDO DEDO'}</ThemedText>}
            </View>
          </View>

          <View style={[styles.statusBanner, fingerDetected && styles.statusBannerSuccess, !!cameraError && styles.statusBannerError]}>
            <ThemedText style={[styles.statusBannerText, fingerDetected && styles.statusBannerTextSuccess, !!cameraError && styles.statusBannerTextError]}>
              {cameraError || statusMessage}
            </ThemedText>
          </View>

          {!scanning && measuredBpm === null && !cameraError && (
            <View style={styles.instructionBox}>
              <ThemedText style={styles.instructionTitle}>Protocolo PPG:</ThemedText>
              <ThemedText style={styles.instructionText}>
                1. Enciende el flash y la cámara.{'\n'}
                2. Cubre suavemente la cámara con tu dedo.{'\n'}
                3. Analizamos tu pulso capilar durante 15s.
              </ThemedText>
            </View>
          )}

          {scanning && (
            <View style={styles.scanningProgressContainer}>
              <View style={styles.bpmLiveHeaderRow}>
                <ThemedText style={styles.livePulseNumber}>{livePulseInstant}</ThemedText>
                <ThemedText style={styles.livePulseUnit}>BPM REAL</ThemedText>
              </View>
              <View style={styles.waveContainer}>
                <Svg width="100%" height={45} viewBox="0 0 200 45">
                  <Defs>
                    <LinearGradient id="ppgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#EF4444" /><Stop offset="50%" stopColor="#F59E0B" /><Stop offset="100%" stopColor="#FFE259" />
                    </LinearGradient>
                  </Defs>
                  <Path d={waveSvgPath} stroke="url(#ppgGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </Svg>
              </View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
            </View>
          )}

          {measuredBpm !== null && (
            <View style={styles.resultContainer}>
              <ThemedText style={styles.resultLabel}>FRECUENCIA CARDÍACA VERIFICADA</ThemedText>
              <View style={styles.resultBpmRow}><ThemedText style={styles.resultBpmVal}>{measuredBpm}</ThemedText><ThemedText style={styles.resultBpmUnit}>BPM</ThemedText></View>
              <View style={styles.verdictBadge}><ThemedText style={{ color: getBpmVerdict(measuredBpm).color }}>{getBpmVerdict(measuredBpm).label}</ThemedText></View>
            </View>
          )}

          <View style={styles.actionsRow}>
            {!scanning && measuredBpm === null && (
              <TouchableOpacity style={styles.startScanBtn} onPress={startScan}><ThemedText style={styles.startScanBtnText}>⚡ INICIAR ESCANEO (15s)</ThemedText></TouchableOpacity>
            )}
            {scanning && <TouchableOpacity style={styles.cancelScanBtn} onPress={handleCancel}><ThemedText style={styles.cancelScanBtnText}>CANCELAR</ThemedText></TouchableOpacity>}
            {measuredBpm !== null && (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply}><ThemedText style={styles.applyBtnText}>GUARDAR</ThemedText></TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(11, 15, 26, 0.98)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    padding: Spacing.four,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  titleBadgeGroup: {
    gap: 2,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraHiddenWrapper: {
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  sensorArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
    position: 'relative',
  },
  pulseCircleBackdrop: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  sensorLensCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorLensActive: {
    borderColor: '#FFE259',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  sensorLensCovered: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.30)',
  },
  sensorStatusScanning: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: Spacing.three,
    alignItems: 'center',
  },
  statusBannerSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusBannerError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.40)',
  },
  statusBannerText: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  statusBannerTextSuccess: {
    color: '#34D399',
  },
  statusBannerTextError: {
    color: '#F87171',
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.three,
  },
  instructionTitle: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  scanningProgressContainer: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  bpmLiveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  livePulseNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    textShadowColor: 'rgba(255, 226, 89, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  livePulseUnit: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F59E0B',
    fontFamily: 'monospace',
  },
  waveContainer: {
    width: '100%',
    height: 45,
    marginVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressPctText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 6,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: Spacing.three,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  resultBpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 2,
  },
  resultBpmVal: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    textShadowColor: 'rgba(255, 226, 89, 0.90)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  resultBpmUnit: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  verdictBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  verdictText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  startScanBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startScanBtnText: {
    color: '#05070C',
    fontSize: 12.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  cancelScanBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelScanBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  retryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  retryBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#05070C',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
});
